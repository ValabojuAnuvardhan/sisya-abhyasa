from pydantic import BaseModel
class ReviewRequest(BaseModel):
    allow_external_ai_for_private_repo: bool=False
