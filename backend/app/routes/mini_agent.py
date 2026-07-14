from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import asyncio
import traceback
from datetime import datetime

from app.services.mini_agent.factory import create_real_agent
from app.services.mini_agent.schema import Message as AgentMessage

router = APIRouter(prefix="/api/mini-agent", tags=["Mini-Agent"])

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []
    model: Optional[str] = "antigraphity"
    provider: Optional[str] = "anthropic"

class ChatResponse(BaseModel):
    content: str
    status: str
    timestamp: str

@router.post("/chat", response_model=ChatResponse)
async def chat_with_mini_agent(request: ChatRequest):
    # Use local Ollama by default (no API key needed)
    # Backend .env already has: LLM_BASE_URL=http://localhost:11434, LLM_MODEL=llama3.2:3b
    api_key = os.getenv("ANTHROPIC_API_KEY")
    
    # Map model name - use env var model if API key set (Anthropic or NVIDIA/OpenAI-compatible)
    model_name = request.model
    provider = os.getenv("LLM_PROVIDER", "anthropic").lower()
    if model_name == "antigraphity":
        if api_key and provider == "anthropic":
            model_name = "claude-3-5-sonnet-20240620"
        elif api_key and provider == "openai":
            model_name = os.getenv("LLM_MODEL", "meta/llama-3.1-70b-instruct")
        else:
            model_name = os.getenv("LLM_MODEL", "llama3.2:3b")
            api_key = os.getenv("LLM_API_KEY", "ollama")
    
    try:
        workspace_dir = os.path.join(os.getcwd(), "data", "mini_agent_workspace")
        
        agent = await create_real_agent(
            api_key=api_key,
            model=model_name,
            workspace_dir=workspace_dir
        )
        
        if request.history:
            if request.history[0].get("role") == "system":
                agent.messages = [] 
            
            for msg in request.history:
                role = msg.get("role")
                content = msg.get("content")
                if role and content:
                    agent.messages.append(AgentMessage(role=role, content=content))
        
        # Add user message to history, then run agent
        agent.add_user_message(request.message)
        result = await agent.run()
        
        return ChatResponse(
            content=result,
            status="success",
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        print(f"[Mini-Agent Error] {str(e)}")
        print(f"[Mini-Agent Traceback] {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))
