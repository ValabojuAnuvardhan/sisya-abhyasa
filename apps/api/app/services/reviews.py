from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.project import Task
from app.models.github import GithubPullRequest,ProjectRepository,PrReview,SkillEvidence

# Sprint 5 deliberately starts with a deterministic evidence interpreter. It never
# claims to have read code, run tests, or verified correctness. Provider-backed
# diff review can be added only behind the explicit private-code consent boundary.
def create_local_review(db:Session, repo:ProjectRepository, pr:GithubPullRequest, project_id):
    task=db.get(Task,pr.task_id) if pr.task_id else None
    limitations=['Code diff was not sent to an external AI provider.','No tests were executed by Śiṣya Abhyāsa.','This review does not certify correctness or expertise.']
    facts=[]
    if pr.merged: facts.append('GitHub records this pull request as merged.')
    else: facts.append(f'GitHub records this pull request as {pr.state}.')
    if task: facts.append(f'The pull request is explicitly linked to the task “{task.title}”.')
    if pr.user_id: facts.append('The pull request author is mapped to the signed-in student through immutable GitHub identity.')
    summary=' '.join(facts) or 'GitHub evidence was captured for this pull request.'
    alignment=(f'Linked to “{task.title}”. Completion criteria: {task.completion_criteria}' if task else 'No project task is linked, so task alignment cannot be assessed.')
    review=PrReview(pull_request_id=pr.id,review_mode='local_evidence',source_scope='github_metadata_and_task',summary=summary,task_alignment=alignment,findings=[{'type':'evidence','text':x} for x in facts],limitations=limitations)
    db.add(review); db.flush()
    if pr.user_id and task:
        for skill in dict.fromkeys(task.required_skills or []):
            db.add(SkillEvidence(user_id=pr.user_id,project_id=project_id,pull_request_id=pr.id,task_id=task.id,skill_name=skill,evidence_kind='task_linked_merged_pr' if pr.merged else 'task_linked_pr',explanation=f'{skill} is recorded as demonstrated evidence because PR #{pr.number} is attributed to the student and linked to a task requiring {skill}. This is evidence of application, not an expertise rating.'))
    return review
