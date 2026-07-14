import os
from pathlib import Path
from typing import List, Tuple, Optional
import asyncio

from .agent import Agent
from .llm.llm_wrapper import LLMClient
from .config import Config
from .tools.bash_tool import BashTool, BashOutputTool, BashKillTool
from .tools.file_tools import ReadTool, WriteTool, EditTool
from .tools.note_tool import SessionNoteTool
from .tools.skill_tool import create_skill_tools
from .schema import LLMProvider, Message

def _is_ollama_model(model: str) -> bool:
    """Check if model is a local Ollama model"""
    ollama_models = ["llama", "mistral", "codellama", "vicuna", "neural-chat", "phi"]
    model_lower = model.lower()
    return any(m in model_lower for m in ollama_models) or ":" in model

async def create_real_agent(
    api_key: str,
    model: str = "claude-3-5-sonnet-20240620",
    workspace_dir: str = "./workspace_mini_agent"
) -> Agent:
    """
    Creates a fully functional Mini-Agent instance with all tools and skills.
    Supports both Anthropic (antigraphity) and local Ollama models.
    """
    workspace_path = Path(workspace_dir).resolve()
    workspace_path.mkdir(parents=True, exist_ok=True)

    # Detect if using Ollama (local) or Anthropic
    use_ollama = _is_ollama_model(model)
    
    # 1. LLM Client
    if use_ollama:
        # Use native Ollama API base for better performance
        ollama_base = os.getenv("LLM_BASE_URL", "http://ollama:11434")
        if not ollama_base.endswith("/v1"):
            ollama_base = ollama_base.rstrip("/") + "/v1"
        llm_client = LLMClient(
            api_key=api_key or "ollama",
            provider=LLMProvider.OLLAMA,
            api_base=ollama_base,
            model=model
        )
    else:
        # Check if using a custom OpenAI-compatible provider (NVIDIA, etc.)
        provider_env = os.getenv("LLM_PROVIDER", "anthropic").lower()
        if provider_env == "openai":
            openai_base = os.getenv("LLM_BASE_URL", "https://integrate.api.nvidia.com/v1")
            llm_client = LLMClient(
                api_key=api_key,
                provider=LLMProvider.OPENAI,
                api_base=openai_base,
                model=model
            )
        else:
            # Anthropic (claude-3-5-sonnet)
            llm_client = LLMClient(
                api_key=api_key,
                provider=LLMProvider.ANTHROPIC,
                api_base="https://api.anthropic.com",
                model=model
            )

    # 2. Tools & Skills
    tools = []
    
    # Bash & Auxiliary
    tools.append(BashTool(workspace_dir=str(workspace_path)))
    tools.append(BashOutputTool())
    tools.append(BashKillTool())
    
    # Files
    tools.extend([
        ReadTool(workspace_dir=str(workspace_path)),
        WriteTool(workspace_dir=str(workspace_path)),
        EditTool(workspace_dir=str(workspace_path))
    ])
    
    # Notes
    tools.append(SessionNoteTool(memory_file=str(workspace_path / ".agent_memory.json")))
    
    # Skills
    skills_dir = str(Path(__file__).parent / "skills")
    skill_tools, skill_loader = create_skill_tools(skills_dir)
    if skill_tools:
        tools.extend(skill_tools)

    # 3. System Prompt
    system_prompt_path = Path(__file__).parent / "config" / "system_prompt.md"
    if system_prompt_path.exists():
        with open(system_prompt_path, "r", encoding="utf-8") as f:
            system_prompt = f.read()
    else:
        system_prompt = "You are a professional security assistant powered by Mini-Agent core."

    # Inject Skills Metadata if loader exists
    if skill_loader:
        metadata = skill_loader.get_skills_metadata_prompt()
        system_prompt = system_prompt.replace("{SKILLS_METADATA}", metadata)

    # 4. Create Agent
    agent = Agent(
        llm_client=llm_client,
        system_prompt=system_prompt,
        tools=tools,
        workspace_dir=str(workspace_path),
        token_limit=100000
    )
    
    return agent
