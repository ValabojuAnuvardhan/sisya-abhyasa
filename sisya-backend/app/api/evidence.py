from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.api.deps import get_current_user
from app.models import (
    User, Profile, Project, ProjectMember, Repository, PullRequest, Commit,
    PRReview, SkillEvidence, Task
)
from app.schemas.evidence import (
    PRReviewRequest, PRReviewResponse, StudentSkillsResponse, ProofOfWorkResponse,
    SkillEvidenceItem, EvidenceDetail, ProofOfWorkProject, ProofOfWorkPR, InlineComment, SkillDemonstrated
)
from app.ai.pr_reviewer import review_pr

router = APIRouter()


@router.post("/pr-review", response_model=PRReviewResponse, status_code=status.HTTP_200_OK)
def create_or_get_pr_review(
    request: PRReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pr = db.query(PullRequest).filter(PullRequest.id == request.pull_request_id).first()
    if not pr:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pull request not found"
        )

    # Verify authorization: current user must be owner or approved member of the linked project
    repo = db.query(Repository).filter(Repository.id == pr.repository_id).first()
    if not repo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Repository linked to PR not found"
        )

    project = db.query(Project).filter(Project.id == repo.project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project linked to repository not found"
        )

    is_owner = (project.owner_id == current_user.id)
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project.id,
        ProjectMember.user_id == current_user.id,
        ProjectMember.status == "approved"
    ).first() is not None

    if not (is_owner or is_member):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You are not a member of this project"
        )

    # Verify PR is merged
    if not pr.merged:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PR review requires a merged pull request"
        )

    # --- Review Caching Check ---
    cached_review = db.query(PRReview).filter(PRReview.pull_request_id == pr.id).first()
    if cached_review:
        return cached_review

    # Gather lightweight metadata context for AI Reviewer (NO full source files)
    commits = db.query(Commit).filter(Commit.repository_id == repo.id).all()
    files_changed = []
    commit_messages = []
    linked_task = None

    for c in commits:
        if c.message:
            commit_messages.append(c.message)
        if c.files_changed:
            files_changed.extend(c.files_changed)
        if c.task_id and not linked_task:
            linked_task = db.query(Task).filter(Task.id == c.task_id).first()

    # Deduplicate file names
    files_changed = list(set(files_changed))

    ai_result = review_pr(
        pr_number=pr.pr_number,
        title=pr.title or f"PR #{pr.pr_number}",
        description=None,
        author=pr.author_github_username,
        files_changed=files_changed,
        commit_messages=commit_messages,
        task_title=linked_task.title if linked_task else None,
        task_description=linked_task.description if linked_task else None,
        task_criteria=linked_task.completion_criteria if linked_task else None,
        tech_stack=project.tech_stack
    )

    review = PRReview(
        pull_request_id=pr.id,
        summary=ai_result.get("summary", "PR review completed."),
        strengths=ai_result.get("strengths", []),
        improvements=ai_result.get("improvements", []),
        inline_comments=ai_result.get("inline_comments", []),
        skills_demonstrated=ai_result.get("skills_demonstrated", []),
        advisory=True,
        advisory_label="AI-generated code review — for learning guidance only"
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Determine student target user for skill evidence
    author_profile = db.query(Profile).filter(Profile.github_username == pr.author_github_username).first()
    target_student_id = author_profile.user_id if author_profile else current_user.id

    # Create SkillEvidence records automatically
    skills_data = ai_result.get("skills_demonstrated", [])
    for sk in skills_data:
        skill_name = sk.get("skill") if isinstance(sk, dict) else str(sk)
        conf = sk.get("confidence", 0.80) if isinstance(sk, dict) else 0.80

        evidence_rec = SkillEvidence(
            student_id=target_student_id,
            skill=skill_name,
            confidence=conf,
            evidence_type="pr_review",
            evidence_id=review.id,
            evidence_link=f"PR #{pr.pr_number}",
            advisory=True
        )
        db.add(evidence_rec)

    db.commit()
    return review


@router.get("/profile/{student_id}/skills", response_model=StudentSkillsResponse, status_code=status.HTTP_200_OK)
def get_student_skills(student_id: UUID, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    evidences = db.query(SkillEvidence).filter(SkillEvidence.student_id == student_id).all()

    # Group evidence items by skill
    skills_map: dict[str, dict] = {}
    for ev in evidences:
        if ev.skill not in skills_map:
            skills_map[ev.skill] = {
                "skill": ev.skill,
                "confidences": [],
                "evidence": []
            }
        skills_map[ev.skill]["confidences"].append(ev.confidence)
        skills_map[ev.skill]["evidence"].append(
            EvidenceDetail(
                type=ev.evidence_type,
                id=str(ev.evidence_id) if ev.evidence_id else None,
                advisory=ev.advisory,
                evidence_link=ev.evidence_link
            )
        )

    items = []
    for skill_name, data in skills_map.items():
        avg_conf = round(sum(data["confidences"]) / len(data["confidences"]), 2) if data["confidences"] else 0.80
        items.append(
            SkillEvidenceItem(
                skill=skill_name,
                confidence=avg_conf,
                evidence=data["evidence"]
            )
        )

    return StudentSkillsResponse(
        student_id=student_id,
        skills=items
    )


@router.get("/profile/{student_id}/proof-of-work", response_model=ProofOfWorkResponse, status_code=status.HTTP_200_OK)
def get_student_proof_of_work(student_id: UUID, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found"
        )

    profile = db.query(Profile).filter(Profile.user_id == student_id).first()

    # Collect Projects
    owned_projects = db.query(Project).filter(Project.owner_id == student_id).all()
    member_entries = db.query(ProjectMember).filter(
        ProjectMember.user_id == student_id,
        ProjectMember.status == "approved"
    ).all()
    member_project_ids = [m.project_id for m in member_entries]
    member_projects = db.query(Project).filter(Project.id.in_(member_project_ids)).all() if member_project_ids else []

    all_projects_dict = {}
    for p in owned_projects:
        all_projects_dict[p.id] = ProofOfWorkProject(
            id=p.id,
            title=p.title,
            description=p.description,
            tech_stack=p.tech_stack or [],
            role="owner"
        )
    for p in member_projects:
        if p.id not in all_projects_dict:
            all_projects_dict[p.id] = ProofOfWorkProject(
                id=p.id,
                title=p.title,
                description=p.description,
                tech_stack=p.tech_stack or [],
                role="contributor"
            )

    projects_list = list(all_projects_dict.values())

    # Collect Merged PRs
    merged_prs_list = []
    if profile and profile.github_username:
        prs = db.query(PullRequest).filter(
            PullRequest.author_github_username == profile.github_username,
            PullRequest.merged == True
        ).all()

        for pr in prs:
            repo = db.query(Repository).filter(Repository.id == pr.repository_id).first()
            merged_prs_list.append(
                ProofOfWorkPR(
                    id=pr.id,
                    pr_number=pr.pr_number,
                    title=pr.title,
                    repository_name=repo.full_name if repo else None,
                    merged_at=pr.merged_at
                )
            )

    # Collect Skills
    skills_response = get_student_skills(student_id=student_id, db=db)

    return ProofOfWorkResponse(
        student_id=student_id,
        github_username=profile.github_username if profile else None,
        target_role=profile.target_role if profile else None,
        education_year=profile.education_year if profile else None,
        projects=projects_list,
        projects_count=len(projects_list),
        merged_prs=merged_prs_list,
        merged_prs_count=len(merged_prs_list),
        skills=skills_response.skills,
        advisory="AI-assessed · Advisory only · Not professional certification"
    )


