from typing import Literal
from pydantic import BaseModel

TaskStatus = Literal['todo','in_progress','in_review','done']

class TaskStatusUpdate(BaseModel):
    status: TaskStatus

class MentorQuestion(BaseModel):
    question: str

class MentorResponse(BaseModel):
    answer: str
    generated_by: Literal['local-demo'] = 'local-demo'
    notice: str = 'Contextual mentor foundation only. No external AI provider is configured.'
