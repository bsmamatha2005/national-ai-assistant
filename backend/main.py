from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from rag import retrieve_context

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

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@app.get("/")
def root():
    return {"status": "Backend is running"}

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    context = retrieve_context(request.message)
    print("=== RETRIEVED CONTEXT ===")
    print(context)
    print("==========================")

    prompt = f"""Use the following context to answer the question accurately. If the context doesn't contain relevant information, answer using your general knowledge but mention that it may not be current.

Context:
{context}

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