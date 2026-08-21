import os
import json
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


def complete(prompt: str, system_prompt: str | None = None) -> str:
    """
    Isolated AI completion abstraction layer.
    The rest of the application ONLY calls complete() and remains
    completely agnostic of the underlying model provider (Claude, OpenAI, Gemini).
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if api_key and api_key.strip() and api_key != "your-anthropic-api-key":
        try:
            from anthropic import Anthropic
            client = Anthropic(api_key=api_key, timeout=15.0)

            kwargs = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 2048,
                "messages": [{"role": "user", "content": prompt}],
                "timeout": 15.0
            }
            if system_prompt:
                kwargs["system"] = system_prompt

            response = client.messages.create(**kwargs)

            text_content = ""
            for block in response.content:
                if hasattr(block, "text"):
                    text_content += block.text

            return text_content
        except Exception as e:
            err_msg = str(e)
            if api_key in err_msg:
                err_msg = err_msg.replace(api_key, "[REDACTED_API_KEY]")
            print(f"[Warning] Anthropic API call failed or timed out after 15s ({err_msg}). Falling back to structured response.")

    # Fallback structured completion for offline testing or when ANTHROPIC_API_KEY is not configured
    return json.dumps({
        "title": "AI Resume Analyzer",
        "description": "An AI-powered resume analysis platform designed for college students to evaluate skill alignment and extract key resume telemetry.",
        "tech_stack": ["Python", "FastAPI", "React", "PostgreSQL"],
        "skills": ["Python", "REST APIs", "PostgreSQL", "AI integration"],
        "estimated_weeks": 6,
        "milestones": [
            {
                "title": "Milestone 1: Project Setup & Auth System",
                "description": "Configure database schemas, JWT user authentication, and basic API infrastructure.",
                "estimated_weeks": 1
            },
            {
                "title": "Milestone 2: Resume Parser & AI Integration",
                "description": "Implement resume text extraction and connect LLM completion service.",
                "estimated_weeks": 2
            },
            {
                "title": "Milestone 3: Student Dashboard & Analytics",
                "description": "Develop UI dashboard for uploading resumes and displaying skill alignment scores.",
                "estimated_weeks": 2
            },
            {
                "title": "Milestone 4: Deployment & Final Verification",
                "description": "Deploy backend to production platform and run complete integration test suite.",
                "estimated_weeks": 1
            }
        ]
    })
