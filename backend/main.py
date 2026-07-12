from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import requests
from rag import retrieve_context
from web_fetch import fetch_url_text
from sources import find_matching_url

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3"

class Message(BaseModel):
    role: str      # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []

class ChatResponse(BaseModel):
    reply: str

@app.get("/")
def root():
    return {"status": "Backend is running"}

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    context = retrieve_context(request.message)

    if context is None:
        url = find_matching_url(request.message)
        if url:
            context = fetch_url_text(url)

    # Build conversation history as text
    history_text = ""
    for msg in request.history:
        role_label = "User" if msg.role == "user" else "Assistant"
        history_text += f"{role_label}: {msg.content}\n"

    if context is None:
        prompt = f"""You are a helpful assistant. The knowledge base has no relevant information for this question.
Tell the user honestly that you don't have this information in your knowledge base — do NOT guess or make up an answer, even if you think you know it from general knowledge.

Conversation so far:
{history_text}

Question: {request.message}

Answer:"""
    else:
        prompt = f"""Use ONLY the following context to answer the question. Do not use any outside knowledge.
If the context does not fully answer the question, say so explicitly instead of filling in gaps.

Context:
{context}

Conversation so far:
{history_text}

Question: {request.message}

Answer:"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }
    response = requests.post(OLLAMA_URL, json=payload)
    data = response.json()
    return ChatResponse(reply=data.get("response", "Error: no response"))