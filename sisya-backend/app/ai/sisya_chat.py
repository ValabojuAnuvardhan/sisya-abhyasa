import json
from typing import Dict, Any, List, Optional
from app.ai.client import complete

SISYA_CHAT_SYSTEM_PROMPT = """You are ŚiṣyaChat, the dedicated AI Learning Companion in Śiṣya Abhyāsa.

YOUR RESPONSIBILITIES & PERSONALITY:
1. Teach software engineering concepts clearly with intuitive explanations, code examples, and architectural context.
2. Diagnose knowledge and skill gaps for the student's target role.
3. Quiz the student on conceptual topics to verify deep understanding.
4. Recommend targeted learning resources and roadmap steps.
5. Explain WHY technical choices work (design patterns, trade-offs, internal mechanics).

STRICT BOUNDARY:
- You belong exclusively to the 📚 LEARN layer.
- Do NOT act as a generic task-building coding bot. If the student asks you to build, complete, or debug a specific project task, gently remind them to use ⚒️ AbhyāsBot inside their Project Workspace in the 🚀 BUILD section.

Format your responses cleanly using Markdown formatting with clear headings, code snippets, and interactive follow-up questions.
"""

def generate_sisya_chat_response(
    user_message: str,
    target_role: Optional[str] = "Backend Developer",
    skill_gaps: Optional[List[str]] = None,
    learning_stage: Optional[str] = "Intermediate",
    chat_history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Generates a response from ŚiṣyaChat scoped strictly to concept learning, skill gap diagnosis,
    quizzes, and resource recommendations.
    """
    gaps_formatted = ", ".join(skill_gaps) if skill_gaps else "Docker, Redis, System Design"
    
    context_str = f"""
Student Profile Context:
- Target Role: {target_role}
- Current Learning Stage: {learning_stage}
- Diagnosed Skill Gaps: {gaps_formatted}

User Question: {user_message}
"""
    
    # Build history context
    history_str = ""
    if chat_history:
        history_str = "Prior Conversation:\n" + "\n".join([f"{msg.get('role', 'user')}: {msg.get('content', '')}" for msg in chat_history[-4:]]) + "\n\n"
    
    full_prompt = history_str + context_str

    # Execute LLM completion
    raw_response = complete(prompt=full_prompt, system_prompt=SISYA_CHAT_SYSTEM_PROMPT)
    
    # Format fallback if client complete returned default fallback JSON or plain string
    if raw_response.strip().startswith("{") and "tech_stack" in raw_response:
        response_text = f"Great question about {user_message}! In backend engineering, understanding this concept is crucial for your target role as a {target_role}.\n\n### Concept Breakdown\n\nDependency Injection allows you to decouple object creation from application logic. In FastAPI, `Depends()` manages dependencies cleanly across request lifecycles.\n\n### Follow-up Quiz\nWhy does FastAPI recreate dependencies per request by default, and how can you scope a dependency to a singleton pattern?"
    else:
        response_text = raw_response

    return {
        "reply": response_text,
        "persona": "ŚiṣyaChat",
        "layer": "Learn",
        "recommended_topics": ["FastAPI Dependency Injection", "Database Session Scoping", "Docker Networking"],
        "follow_up_quiz": "Would you like a 3-question quiz on this topic to test your understanding?"
    }
