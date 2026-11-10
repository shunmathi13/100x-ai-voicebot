import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY is missing from .env")

client = Groq(api_key=api_key)

app = FastAPI(title="100x Personal AI Voice Bot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str

SYSTEM_PROMPT = """
You are a personal AI interview assistant representing the user.
Answer naturally in first person, as if the user is speaking.

Verified background:
- PhD in Mechatronics Engineering.
- Seven years of professional experience.
- Background in mechanical engineering, research,
  automation, software development and AI.
- Skills include Python, AI/ML, LLMs and AI agents.

Keep answers professional, natural and concise,
usually 80 to 120 words.
Never invent employers, achievements, projects or metrics.
"""

@app.get("/")
def home():
    return {"message": "100x AI Voice Bot is running"}

@app.post("/chat")
def chat(request: ChatRequest):
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.question}
            ],
            max_completion_tokens=300
        )

        return {"answer": response.choices[0].message.content}

    except Exception as error:
        print("Groq API error:", str(error))
        raise HTTPException(
            status_code=500,
            detail="Unable to generate an AI response. Please try again."
        )
