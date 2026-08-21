from app.models.user import User, StudentProfile, Skill, user_skills
from app.models.project import Project, Milestone, Task, ProjectSprint, TaskDependency, TaskBlocker, ProjectMember, TeamSpaceSettings, TeamMessage, TeamMessageReference, ProjectJoinRequest
from app.models.github import ProjectRepository, GithubWebhookEvent, GithubCommit, GithubPullRequest, PrReview, SkillEvidence
from app.github.models import GithubConnection, ProjectGithubRepository
from app.github.task_traceability.models import TaskGitBranch, TaskCommit, TaskPullRequest
from app.github.evidence_graph.models import EvidenceIdentity, EvidenceRecord, EvidenceLink, EvidenceSkill, EvidenceEvent
from app.models.evaluations import UserSkillProficiency, MentorObservation, ProjectEvaluation, RecruiterSettings
from app.models.learn import LearningRoadmap, LearningRoadmapNode, LearningChecklist, LearningChecklistItem, LearningResource, SavedLearningResource, LearningResourceProgress
from app.models.network import NetworkPost, NetworkPostLike, NetworkPostComment, NetworkPostShare, NetworkPostRebuild
from app.models.opportunity import CareerOpportunity, OpportunityApplication, CareerActionPlan, CareerAction

__all__ = [
    'User', 'StudentProfile', 'Skill', 'user_skills',
    'Project', 'Milestone', 'Task', 'ProjectSprint', 'TaskDependency', 'TaskBlocker', 'ProjectMember',
    'ProjectRepository', 'GithubWebhookEvent', 'GithubCommit', 'GithubPullRequest', 'PrReview', 'SkillEvidence',
    'GithubConnection', 'ProjectGithubRepository',
    'TaskGitBranch', 'TaskCommit', 'TaskPullRequest',
    'EvidenceIdentity', 'EvidenceRecord', 'EvidenceLink', 'EvidenceSkill', 'EvidenceEvent',
    'UserSkillProficiency', 'MentorObservation', 'ProjectEvaluation', 'RecruiterSettings',
    'LearningRoadmap', 'LearningRoadmapNode', 'LearningChecklist', 'LearningChecklistItem', 'LearningResource', 'SavedLearningResource', 'LearningResourceProgress',
    'NetworkPost', 'NetworkPostLike', 'NetworkPostComment', 'NetworkPostShare', 'NetworkPostRebuild',
    'CareerOpportunity', 'OpportunityApplication', 'CareerActionPlan', 'CareerAction'
]




