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
        prompt = f"""You are a helpful assistant for Indian users. Follow these rules strictly:
1. Always respond in the SAME language the user asked in. If the question is in Kannada, your entire answer must be in Kannada. If in English, answer in English.
2. Use natural, everyday language — avoid robotic or overly formal phrasing.
3. Use the following context to answer accurately. If the context doesn't contain relevant information, say so in the same language as the question, and suggest checking official sources.

Context:
{context}

Conversation so far:
{history_text}

Question: {request.message}

Answer (in the same language as the question):"""

    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False
    }
    response = requests.post(OLLAMA_URL, json=payload)
    data = response.json()
    return ChatResponse(reply=data.get("response", "Error: no response"))