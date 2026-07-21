import os
import json
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import requests

from rag import retrieve_context
from web_fetch import fetch_url_text
from sources import find_matching_url

from database import Base, engine
import models
from auth_utils import get_current_user
from auth_routes import router as auth_router
from oauth_routes import router as oauth_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Required by authlib's OAuth flow to hold the temporary state/nonce.
app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ.get("SESSION_SECRET", "change-this-in-production"),
)

app.include_router(auth_router)
app.include_router(oauth_router)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3"


class Message(BaseModel):
    role: str      # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []


@app.get("/")
def root():
    return {"status": "Backend is running"}


def build_prompt(request: ChatRequest) -> str:
    context = retrieve_context(request.message)

    if context is None:
        url = find_matching_url(request.message)
        if url:
            context = fetch_url_text(url)

    history_text = ""
    for msg in request.history:
        role_label = "User" if msg.role == "user" else "Assistant"
        history_text += f"{role_label}: {msg.content}\n"

    return f"""You are a helpful assistant for Indian users. Follow these rules strictly:
1. Always respond in the SAME language the user asked in. If the question is in Kannada, your entire answer must be in Kannada. If in English, answer in English.
2. Use natural, everyday language — avoid robotic or overly formal phrasing.
3. Use the following context to answer accurately. If the context doesn't contain relevant information, say so in the same language as the question, and suggest checking official sources.

Context:
{context}

Conversation so far:
{history_text}

Question: {request.message}

Answer (in the same language as the question):"""


@app.post("/chat")
def chat(request: ChatRequest, current_user: models.User = Depends(get_current_user)):
    prompt = build_prompt(request)

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": True,
        # Trim these if answers still feel slow on your machine.
        "options": {
            "num_predict": 512,
        },
    }

    def generate():
        with requests.post(OLLAMA_URL, json=payload, stream=True) as r:
            for line in r.iter_lines():
                if not line:
                    continue
                chunk = json.loads(line)
                token = chunk.get("response", "")
                if token:
                    yield token
                if chunk.get("done"):
                    break

    return StreamingResponse(generate(), media_type="text/plain")