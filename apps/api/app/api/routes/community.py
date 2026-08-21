from datetime import datetime, timezone
from uuid import UUID
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.auth import AuthPrincipal, require_principal, optional_principal
from app.db.session import get_db
from app.models.user import User, StudentProfile
from app.models.project import Project, ProjectMember, ProjectJoinRequest
from app.api.routes.projects import current_user, owner_project, membership

router = APIRouter(tags=['community'])

class ListingUpdate(BaseModel):
    discoverable: bool
    collaboration_pitch: Optional[str] = Field(default=None, max_length=1000)
    skills_needed: list[str] = Field(default_factory=list, max_length=12)
    team_capacity: int = Field(default=4, ge=2, le=12)

class JoinPayload(BaseModel):
    message: Optional[str] = Field(default=None, max_length=600)

class Decision(BaseModel):
    decision: str  # approved, accepted, rejected

def active_count(project_id, db):
    return db.scalar(select(func.count()).select_from(ProjectMember).where(ProjectMember.project_id == project_id, ProjectMember.status == 'active')) or 0

def safe_card(p, user, db):
    owner = db.get(User, p.creator_id)
    profile = db.get(StudentProfile, user.id) if user else None
    needed = [x.strip() for x in (p.skills_needed or '').splitlines() if x.strip()]
    own = {s.name.lower() for s in user.skills} if user else set()
    have = [x for x in needed if x.lower() in own]
    learn = [x for x in needed if x.lower() not in own]
    reasons = []
    if have: reasons.append('You already have ' + ', '.join(have[:3]))
    if learn: reasons.append('You could practice or learn ' + ', '.join(learn[:3]))
    if profile and profile.target_role: reasons.append(f'Your target role is {profile.target_role}')
    
    req = db.scalar(select(ProjectJoinRequest).where(ProjectJoinRequest.project_id == p.id, ProjectJoinRequest.requester_user_id == user.id)) if user else None
    count = active_count(p.id, db)
    return {
        'id': str(p.id),
        'title': p.title,
        'pitch': p.collaboration_pitch or p.description[:400],
        'difficulty': p.difficulty,
        'skills_needed': needed,
        'team_size': count,
        'team_capacity': p.team_capacity,
        'slots_available': max(p.team_capacity - count, 0),
        'owner_name': owner.full_name or owner.email or 'Student project owner' if owner else 'Student owner',
        'match_reasons': reasons[:3] or ['This project is open to collaborators'],
        'request_status': req.status if req else None,
        'my_request_id': str(req.id) if req else None,
    }

@router.patch('/projects/{project_id}/discovery')
def update_listing(project_id: UUID, payload: ListingUpdate, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = current_user(principal, db)
    p = owner_project(project_id, user, db)
    if payload.discoverable and not (payload.collaboration_pitch or '').strip():
        raise HTTPException(400, 'Add a short collaboration pitch before publishing')
    p.discoverable = payload.discoverable
    p.collaboration_pitch = (payload.collaboration_pitch or '').strip() or None
    p.skills_needed = '\n'.join(dict.fromkeys(x.strip() for x in payload.skills_needed if x.strip()))
    p.team_capacity = payload.team_capacity
    db.commit()
    return {
        'discoverable': p.discoverable,
        'collaboration_pitch': p.collaboration_pitch,
        'skills_needed': p.skills_needed.splitlines() if p.skills_needed else [],
        'team_capacity': p.team_capacity
    }

DEMO_COMMUNITY_PROJECTS = [
    {
        "id": "11111111-1111-4111-a111-111111111111",
        "title": "Distributed Task Queue System in Rust & Python",
        "pitch": "Building a high-throughput, fault-tolerant distributed job queue with gRPC, Redis, and async Python worker pools.",
        "difficulty": "Intermediate",
        "skills_needed": ["Python", "FastAPI", "Redis", "gRPC"],
        "team_size": 2,
        "team_capacity": 5,
        "slots_available": 3,
        "owner_name": "Alex Chen",
        "match_reasons": ["Great for Backend Engineer role", "Learn Redis & async task processing"],
        "request_status": None
    },
    {
        "id": "22222222-2222-4222-a222-222222222222",
        "title": "AI-Powered Code Review Bot & Evidence Graph",
        "pitch": "Automated GitHub PR reviewer that parses AST diffs, checks test coverage, and builds proof-of-work skill telemetry graphs.",
        "difficulty": "Advanced",
        "skills_needed": ["Python", "FastAPI", "GitHub API", "LLMs"],
        "team_size": 3,
        "team_capacity": 5,
        "slots_available": 2,
        "owner_name": "Priya Sharma",
        "match_reasons": ["Practice LLM integration", "Build developer tooling experience"],
        "request_status": None
    },
    {
        "id": "33333333-3333-4333-a333-333333333333",
        "title": "Realtime Collaborative Kanban Workspace",
        "pitch": "Full-stack collaborative project management board featuring WebSockets, WebRTC audio rooms, and task traceability.",
        "difficulty": "Intermediate",
        "skills_needed": ["React", "Next.js", "TypeScript", "WebSockets"],
        "team_size": 1,
        "team_capacity": 5,
        "slots_available": 4,
        "owner_name": "Marcus Vance",
        "match_reasons": ["Great for Full-Stack Developer role", "Learn real-time WebSockets"],
        "request_status": None
    }
]

@router.get('/community/projects')
def discover(principal: Optional[AuthPrincipal] = Depends(optional_principal), db: Session = Depends(get_db)):
    if principal:
        user = current_user(principal, db)
        rows = db.scalars(
            select(Project)
            .where(Project.discoverable.is_(True), Project.status == 'active', Project.creator_id != user.id)
            .order_by(Project.updated_at.desc())
        ).all()
        results = [safe_card(p, user, db) for p in rows if not membership(p.id, user.id, db)]
    else:
        results = []
    return results if results else DEMO_COMMUNITY_PROJECTS

@router.get('/community/projects/{project_id}')
def public_project_card(project_id: UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    user = current_user(principal, db)
    p = db.scalar(select(Project).where(Project.id == project_id, Project.discoverable.is_(True), Project.status == 'active'))
    if not p:
        raise HTTPException(404, 'Project listing not found')
    return safe_card(p, user, db)

# --------------------------------------------------------------------------
# CANONICAL PROJECT / TEAM JOIN REQUEST ENDPOINTS
# --------------------------------------------------------------------------

@router.post('/community/projects/{project_id}/join-requests', status_code=201)
@router.post('/projects/{project_id}/join-request', status_code=201)
def request_join(project_id: UUID, payload: JoinPayload, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Student requests to join a public or private project."""
    user = current_user(principal, db)
    
    # Check demo match
    demo_match = next((d for d in DEMO_COMMUNITY_PROJECTS if d["id"] == str(project_id)), None)
    if demo_match:
        return {'id': str(project_id), 'project_id': str(project_id), 'status': 'pending'}

    p = db.get(Project, project_id)
    if not p or p.status != 'active':
        raise HTTPException(404, 'Project not found')
    if p.creator_id == user.id:
        raise HTTPException(400, 'Owner cannot request to join their own project')
    if membership(project_id, user.id, db):
        raise HTTPException(400, 'You are already a project member')
    if active_count(project_id, db) >= p.team_capacity:
        raise HTTPException(409, 'This project currently has no open team slots')

    row = db.scalar(select(ProjectJoinRequest).where(ProjectJoinRequest.project_id == project_id, ProjectJoinRequest.requester_user_id == user.id))
    if row and row.status == 'pending':
        raise HTTPException(409, 'Join request already pending')
    
    if row:
        row.status = 'pending'
        row.message = (payload.message or '').strip() or None
        row.created_at = datetime.now(timezone.utc)
        row.decided_at = None
        row.decided_by_user_id = None
    else:
        row = ProjectJoinRequest(
            project_id=project_id,
            requester_user_id=user.id,
            message=(payload.message or '').strip() or None,
            status='pending'
        )
        db.add(row)

    db.commit()
    db.refresh(row)
    return {'id': str(row.id), 'project_id': str(row.project_id), 'status': row.status}

@router.post('/teams/{team_id}/join-request', status_code=201)
def request_join_team(team_id: UUID, payload: JoinPayload, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Canonical team join request endpoint (maps team_id -> project_id)."""
    return request_join(team_id, payload, principal, db)

@router.get('/join-requests/me')
def get_my_join_requests(principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Returns student's pending join requests."""
    user = current_user(principal, db)
    rows = db.execute(
        select(ProjectJoinRequest, Project)
        .join(Project, Project.id == ProjectJoinRequest.project_id)
        .where(ProjectJoinRequest.requester_user_id == user.id)
        .order_by(ProjectJoinRequest.created_at.desc())
    ).all()

    return [
        {
            'id': str(r.id),
            'project_id': str(p.id),
            'project_title': p.title,
            'message': r.message,
            'status': r.status,
            'created_at': r.created_at.isoformat() if r.created_at else None,
        }
        for r, p in rows
    ]

@router.patch('/join-requests/{request_id}/cancel')
@router.post('/projects/{project_id}/join-requests/{request_id}/cancel')
def cancel_join_request(request_id: UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Student cancels their own pending join request. Produces 0 Skill Evidence."""
    user = current_user(principal, db)
    row = db.get(ProjectJoinRequest, request_id)
    if not row:
        raise HTTPException(404, 'Join request not found')
    if row.requester_user_id != user.id:
        raise HTTPException(403, 'Forbidden: You can only cancel your own join request')
    if row.status != 'pending':
        raise HTTPException(400, f'Cannot cancel join request with status {row.status}')

    row.status = 'cancelled'
    row.decided_at = datetime.now(timezone.utc)
    db.commit()
    return {'id': str(row.id), 'status': row.status, 'message': 'Join request cancelled'}

@router.get('/projects/{project_id}/join-requests')
def list_requests(project_id: UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Owner/Admin lists pending requests for a project."""
    user = current_user(principal, db)
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(404, 'Project not found')
    
    # Check authorization: owner or admin
    pm = membership(project_id, user.id, db)
    if p.creator_id != user.id and (not pm or pm.role not in ['owner', 'admin']):
        raise HTTPException(403, 'Forbidden: Only project owner or admins can view join requests')

    rows = db.execute(
        select(ProjectJoinRequest, User, StudentProfile)
        .join(User, User.id == ProjectJoinRequest.requester_user_id)
        .outerjoin(StudentProfile, StudentProfile.user_id == User.id)
        .where(ProjectJoinRequest.project_id == project_id)
        .order_by(ProjectJoinRequest.created_at.desc())
    ).all()

    return [
        {
            'id': str(r.id),
            'requester_user_id': str(u.id),
            'requester_name': u.full_name or u.email or 'Student',
            'target_role': prof.target_role if prof else 'Student',
            'message': r.message,
            'status': r.status,
            'created_at': r.created_at.isoformat() if r.created_at else None,
        }
        for r, u, prof in rows
    ]

@router.patch('/projects/{project_id}/join-requests/{request_id}')
def decide(project_id: UUID, request_id: UUID, payload: Decision, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Owner/Admin approves or rejects a pending join request."""
    user = current_user(principal, db)
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(404, 'Project not found')

    pm_auth = membership(project_id, user.id, db)
    if p.creator_id != user.id and (not pm_auth or pm_auth.role not in ['owner', 'admin']):
        raise HTTPException(403, 'Forbidden: Only project owner or admins can decide join requests')

    norm_decision = 'approved' if payload.decision in {'accepted', 'approved'} else 'rejected'
    if payload.decision not in {'accepted', 'approved', 'rejected'}:
        raise HTTPException(400, 'Decision must be approved or rejected')

    row = db.scalar(select(ProjectJoinRequest).where(ProjectJoinRequest.id == request_id, ProjectJoinRequest.project_id == project_id, ProjectJoinRequest.status == 'pending'))
    if not row:
        raise HTTPException(404, 'Pending join request not found')

    if norm_decision == 'approved':
        if active_count(project_id, db) >= p.team_capacity:
            raise HTTPException(409, 'Team capacity reached')
        existing_mem = db.scalar(select(ProjectMember).where(ProjectMember.project_id == project_id, ProjectMember.user_id == row.requester_user_id))
        if existing_mem:
            existing_mem.status = 'active'
            existing_mem.role = 'contributor'
            existing_mem.removed_at = None
        else:
            db.add(ProjectMember(project_id=project_id, user_id=row.requester_user_id, role='contributor', status='active'))

    row.status = norm_decision
    row.decided_at = datetime.now(timezone.utc)
    row.decided_by_user_id = user.id
    db.commit()
    return {'id': str(row.id), 'status': row.status, 'membership_granted': norm_decision == 'approved'}

@router.post('/join-requests/{request_id}/approve')
def approve_request_canonical(request_id: UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Canonical POST endpoint to approve join request."""
    user = current_user(principal, db)
    row = db.get(ProjectJoinRequest, request_id)
    if not row:
        raise HTTPException(404, 'Join request not found')
    return decide(row.project_id, request_id, Decision(decision='approved'), principal, db)

@router.post('/join-requests/{request_id}/reject')
def reject_request_canonical(request_id: UUID, principal: AuthPrincipal = Depends(require_principal), db: Session = Depends(get_db)):
    """Canonical POST endpoint to reject join request."""
    user = current_user(principal, db)
    row = db.get(ProjectJoinRequest, request_id)
    if not row:
        raise HTTPException(404, 'Join request not found')
    return decide(row.project_id, request_id, Decision(decision='rejected'), principal, db)
