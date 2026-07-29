from uuid import UUID
from pydantic import BaseModel, Field
class RepositoryConnect(BaseModel):
    installation_id:int
    full_name:str=Field(pattern=r'^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$')
class PullRequestTaskLink(BaseModel): task_id:UUID|None=None
