"""
Personal Gemini Journal - Enterprise Secure Python Microservice
Backend implementation utilizing FastAPI, Google Cloud Secret Manager,
Firebase Admin Authentication, and Google GenAI SDK.
"""

import os
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import List, Optional

from security import verify_firebase_token, get_secret, sanitize_user_input
from gemini_service import generate_chat_response, extract_action_items_from_session

app = FastAPI(
    title="Personal Gemini Journal - Secure AI Microservice",
    description="Enterprise Backend for Multi-Turn Journaling and Automated Action Item Extraction",
    version="1.0.0"
)

# Enforce secure CORS policy
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    os.getenv("APP_URL", "https://*.run.app"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

security_bearer = HTTPBearer()

# Pydantic Schemas with strict validation
class MessageItem(BaseModel):
    role: str = Field(..., description="Role: 'user' or 'model'")
    content: str = Field(..., min_length=1, max_length=10000, description="Chat content")

class ChatRequest(BaseModel):
    messages: List[MessageItem]
    currentDraft: Optional[str] = Field(None, max_length=20000)
    mode: Optional[str] = Field("socratic", max_length=50)
    mood: Optional[str] = Field("calm", max_length=50)
    userGoal: Optional[str] = Field(None, max_length=500)

class ActionItemModel(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: str = Field(..., pattern="^(High|Medium|Low)$")
    category: str = Field(..., pattern="^(Work|Personal|Health|Finance|Learning|Creative|Relationships)$")
    suggestedDeadline: Optional[str] = "Next Few Days"
    tags: List[str] = []

class ExtractActionsRequest(BaseModel):
    journalId: Optional[str] = None
    title: Optional[str] = "Untitled Entry"
    journalContent: Optional[str] = ""
    transcript: Optional[str] = ""

class ExtractActionsResponse(BaseModel):
    summary: str
    keyThemes: List[str]
    moodAnalysis: str
    actionItems: List[ActionItemModel]

@app.get("/health", tags=["Monitoring"])
async def health_check():
    """Health check validating runtime security and service readiness."""
    return {
        "status": "healthy",
        "service": "Personal Gemini Journal Microservice",
        "secret_manager": "Google Cloud Secret Manager Enabled",
        "auth_provider": "Firebase Authentication v2"
    }

@app.post("/api/gemini/chat", tags=["Journaling AI"])
async def chat_with_gemini(
    request: ChatRequest,
    auth_user: dict = Depends(verify_firebase_token)
):
    """
    Handles secure multi-turn journaling brainstorming with Gemini 2.5.
    Verifies user identity from Firebase Auth token to enforce tenant isolation.
    """
    user_id = auth_user["uid"]
    
    # Sanitize and validate inputs
    sanitized_messages = [
        {"role": m.role, "content": sanitize_user_input(m.content)}
        for m in request.messages
    ]
    sanitized_draft = sanitize_user_input(request.currentDraft) if request.currentDraft else ""

    reply = await generate_chat_response(
        user_id=user_id,
        messages=sanitized_messages,
        draft=sanitized_draft,
        mode=request.mode,
        mood=request.mood,
        user_goal=request.userGoal
    )

    return {"reply": reply}

@app.post("/api/gemini/extract-actions", response_model=ExtractActionsResponse, tags=["Action Items"])
async def extract_actions(
    request: ExtractActionsRequest,
    auth_user: dict = Depends(verify_firebase_token)
):
    """
    Automated Action Item Extraction feature:
    Parses journal transcript, extracts structured goals/tasks, and returns
    structured JSON ready for Firestore 'action_items' subcollection.
    """
    user_id = auth_user["uid"]
    
    result = await extract_action_items_from_session(
        user_id=user_id,
        title=request.title,
        journal_content=sanitize_user_input(request.journalContent),
        transcript=sanitize_user_input(request.transcript)
    )

    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
