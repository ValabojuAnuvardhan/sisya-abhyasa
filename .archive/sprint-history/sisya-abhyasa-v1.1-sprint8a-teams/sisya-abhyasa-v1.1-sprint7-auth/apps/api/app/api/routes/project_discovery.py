from collections import defaultdict, deque
from time import monotonic
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.core.auth import AuthPrincipal, require_principal
from app.db.session import get_db
from app.models.user import User
from app.schemas.project_discovery import ProjectDiscoveryRequest, ProjectDiscoveryResponse
from app.services.project_discovery import discover

router=APIRouter(tags=['project-discovery'])
_calls: dict[str, deque[float]] = defaultdict(deque)

def _limit(subject: str):
    now=monotonic(); q=_calls[subject]
    while q and now-q[0] > 60: q.popleft()
    if len(q)>=8: raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS,detail='Too many recommendation requests. Try again shortly.')
    q.append(now)

@router.post('/project-ideas/recommend',response_model=ProjectDiscoveryResponse)
async def recommend(payload: ProjectDiscoveryRequest, principal: AuthPrincipal=Depends(require_principal), db: Session=Depends(get_db)):
    _limit(principal.subject)
    user=db.scalar(select(User).where(User.auth_subject==principal.subject).options(selectinload(User.profile),selectinload(User.skills)))
    if not user or not user.profile or not user.profile.onboarding_completed:
        raise HTTPException(status_code=400,detail='Complete onboarding before requesting project recommendations.')
    return await discover(user,payload)
