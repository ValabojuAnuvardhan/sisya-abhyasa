from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Project, ProjectMember
from app.schemas.task import TeamMemberResponse, MemberStatusUpdate
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/{project_id}/join", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
def request_to_join_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if project.owner_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You are the owner of this project")

    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Membership request already exists with status: {existing.status}"
        )

    member = ProjectMember(
        project_id=project_id,
        user_id=current_user.id,
        role="contributor",
        status="pending"
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.get("/{project_id}/members", response_model=list[TeamMemberResponse], status_code=status.HTTP_200_OK)
def get_project_members(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Access allowed for owner or any existing member
    is_owner = (project.owner_id == current_user.id)
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()

    if not is_owner and not is_member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    members = db.query(ProjectMember).filter(ProjectMember.project_id == project_id).all()
    return members


@router.patch("/{project_id}/members/{member_id}", response_model=TeamMemberResponse, status_code=status.HTTP_200_OK)
def update_member_status(
    project_id: UUID,
    member_id: UUID,
    payload: MemberStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Only project owner can approve or reject join requests
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project owner can approve or reject membership requests"
        )

    member = db.query(ProjectMember).filter(
        ProjectMember.id == member_id,
        ProjectMember.project_id == project_id
    ).first()

    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member request not found")

    if payload.status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Allowed values: approved, rejected"
        )

    member.status = payload.status
    db.commit()
    db.refresh(member)
    return member
