"""
Gemini AI Service Module
Leverages the modern Google GenAI Python SDK with Gemini 2.5 models
to deliver multi-turn structured journaling conversations and automated
Action Item Extraction using Pydantic schemas.
"""

import json
from typing import List, Dict, Any
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from security import get_secret

def get_genai_client() -> genai.Client:
    """Initializes Google GenAI Client with Secret Manager resolved API key."""
    api_key = get_secret("GEMINI_API_KEY")
    return genai.Client(api_key=api_key)

async def generate_chat_response(
    user_id: str,
    messages: List[Dict[str, str]],
    draft: str,
    mode: str = "socratic",
    mood: str = "calm",
    user_goal: str = ""
) -> str:
    """
    Generates intelligent, multi-turn reflective responses for journaling and brainstorming.
    """
    client = get_genai_client()

    system_instruction = f"""You are the Personal Gemini Journal Companion—a perceptive, empathetic, and Socratic reflection partner.
Your mission is to help user (ID: {user_id[:6]}...) reflect deeply, overcome mental friction, brainstorm actionable strategies, and structure thoughts.

Active Mode: {mode}
Current Mood: {mood}
Session Intention: {user_goal or 'General Growth & Clarity'}

Instructions:
1. Validate feelings without dwelling excessively in unconstructive loops.
2. Ask 1-2 focused, thought-provoking questions per turn.
3. If the user writes draft notes in their scratchpad, synthesize and reference them contextually.
4. Keep replies clear, conversational, and organized with markdown."""

    formatted_contents = []
    for msg in messages:
        role = "user" if msg["role"] == "user" else "model"
        formatted_contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=msg["content"])]
            )
        )

    if draft and draft.strip():
        formatted_contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=f"[User's Current Journal Scratchpad Notes]:\n{draft}\n\nWhat are your insights on this?")]
            )
        )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=formatted_contents,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            max_output_tokens=1024,
        )
    )

    return response.text or "I'm listening closely. What is the most important thread you want to explore?"

# Structured Action Item Schema for Pydantic
class ExtractedAction(BaseModel):
    title: str = Field(description="Action-oriented task title with active verb")
    description: str = Field(default="", description="Contextual notes or details")
    priority: str = Field(description="'High', 'Medium', or 'Low'")
    category: str = Field(description="'Work', 'Personal', 'Health', 'Finance', 'Learning', 'Creative', or 'Relationships'")
    suggestedDeadline: str = Field(default="This Week", description="Timeframe or date")
    tags: List[str] = Field(default_factory=list, description="Keywords")

class SessionExtractionResult(BaseModel):
    summary: str = Field(description="2-3 sentence executive synthesis of the reflection")
    keyThemes: List[str] = Field(description="3 to 5 core themes")
    moodAnalysis: str = Field(description="Emotional trajectory")
    actionItems: List[ExtractedAction] = Field(description="Concrete goals and tasks extracted")

async def extract_action_items_from_session(
    user_id: str,
    title: str,
    journal_content: str,
    transcript: str
) -> Dict[str, Any]:
    """
    Automated Action Item Extraction:
    Parses journal notes + interactive dialogue transcript to extract concrete action items.
    """
    client = get_genai_client()

    analysis_payload = f"""
Journal Session Title: {title}

User Scratchpad / Journal Content:
{journal_content}

Interactive Brainstorming Conversation:
{transcript}
""".strip()

    prompt = f"""You are an Executive Life & Work Strategist. Parse the following journal session and multi-turn brainstorming transcript.
Identify every task, commitment, habit change, creative project, or next step mentioned or implied.
Return a structured output conforming strictly to the requested schema.

Journal Transcript:
{analysis_payload}"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=SessionExtractionResult,
            temperature=0.2,
        )
    )

    if not response.text:
        return {
            "summary": "Session recorded.",
            "keyThemes": ["Journaling"],
            "moodAnalysis": "Calm",
            "actionItems": []
        }

    return json.loads(response.text)
