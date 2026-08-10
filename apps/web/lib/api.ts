const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sisya_auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sisya_auth_token', token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sisya_auth_token');
  }
}

export async function api(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(`${API}${path}`, { ...init, headers, cache: 'no-store', credentials: 'include' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ detail: 'Request failed. Please check network connection.' }));
    let msg = data.detail ?? 'Request failed';
    if (Array.isArray(msg)) {
      msg = msg.map((e: any) => e.msg || e.detail || 'Invalid input').join('; ');
    } else if (typeof msg === 'object') {
      msg = JSON.stringify(msg);
    }
    throw new Error(msg);
  }
  return res.json();
}

export interface GitHubStatusResponse {
  connected: boolean;
  username?: string | null;
  avatar?: string | null;
  github_user_id?: string | null;
  connected_at?: string | null;
  last_sync?: string | null;
}

export interface GithubRepositoryItem {
  github_repo_id: string;
  repo_name: string;
  owner: string;
  full_name: string;
  description?: string | null;
  visibility: string;
  language?: string | null;
  default_branch: string;
  html_url: string;
  stars: number;
  forks: number;
  updated_at?: string | null;
}

export interface GithubRepositoryListResponse {
  repositories: GithubRepositoryItem[];
  total_count: number;
  page: number;
  per_page: number;
}

export interface ProjectRepositoryResponse {
  linked: boolean;
  project_id?: string | null;
  repository?: GithubRepositoryItem | null;
  linked_at?: string | null;
  updated_at?: string | null;
}

export interface UnlinkRepositoryResponse {
  unlinked: boolean;
  message: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
}

export async function connectGitHub(): Promise<{ authorization_url: string }> {
  return api('/github/connect', { method: 'POST' });
}

export async function getGitHubStatus(): Promise<GitHubStatusResponse> {
  return api('/github/status', { method: 'GET' });
}

export async function disconnectGitHub(): Promise<{ disconnected: boolean; message: string }> {
  return api('/github/disconnect', { method: 'POST' });
}

export async function refreshGitHubConnection(): Promise<GitHubStatusResponse> {
  return api('/github/refresh', { method: 'POST' });
}

export async function getGitHubRepositories(
  page: number = 1,
  perPage: number = 30,
  sort: string = 'updated'
): Promise<GithubRepositoryListResponse> {
  return api(`/github/repositories?page=${page}&per_page=${perPage}&sort=${sort}`, { method: 'GET' });
}

export async function searchGitHubRepositories(query: string): Promise<GithubRepositoryListResponse> {
  return api(`/github/repositories/search?q=${encodeURIComponent(query)}`, { method: 'GET' });
}

export async function linkProjectRepository(
  projectId: string,
  repositoryId: string | number
): Promise<ProjectRepositoryResponse> {
  return api('/github/repositories/link', {
    method: 'POST',
    body: JSON.stringify({ project_id: projectId, repository_id: repositoryId }),
  });
}

export async function getProjectLinkedRepository(projectId: string): Promise<ProjectRepositoryResponse> {
  return api(`/github/repositories/current/${projectId}`, { method: 'GET' });
}

export async function unlinkProjectRepository(projectId: string): Promise<UnlinkRepositoryResponse> {
  return api(`/github/repositories/unlink/${projectId}`, { method: 'DELETE' });
}

export async function getUserProjects(): Promise<ProjectItem[]> {
  try {
    const data = await api('/projects', { method: 'GET' });
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  } catch {
    // Fallback demo project list for offline testing
    return [
      { id: '11111111-1111-1111-1111-111111111111', title: 'AI Resume Builder Project', description: 'Student Capstone Project' },
      { id: '22222222-2222-2222-2222-222222222222', title: 'Sisya Abhyasa Core Monorepo', description: 'Evidence Platform' }
    ];
  }
}

export async function syncProjectRepository(projectId: string): Promise<any> {
  return api(`/github/sync/${projectId}`, { method: 'POST' });
}

export async function getSyncStatus(projectId: string): Promise<any> {
  return api(`/github/sync/status/${projectId}`, { method: 'GET' });
}

export async function getEvidenceTimeline(projectId: string): Promise<any> {
  return api(`/github/evidence/timeline/${projectId}`, { method: 'GET' });
}

export async function getEvidenceSummary(projectId: string): Promise<any> {
  return api(`/github/evidence/summary/${projectId}`, { method: 'GET' });
}

export interface RepositoryOverviewResponse {
  project_id: string;
  repo_name: string;
  owner: string;
  visibility: string;
  language?: string | null;
  default_branch: string;
  repository_age_days: number;
  last_commit_at?: string | null;
  last_sync_at?: string | null;
  total_commits: number;
  total_pull_requests: number;
  total_branches: number;
  total_contributors: number;
}

export interface CommitAnalyticsResponse {
  total_commits: number;
  today: number;
  this_week: number;
  this_month: number;
  average_commits_per_day: number;
  latest_commit?: {
    sha: string;
    message: string;
    committed_at?: string | null;
    author: string;
    html_url: string;
  } | null;
  largest_commit?: {
    sha: string;
    message: string;
    files_changed: number;
    lines_added: number;
    lines_deleted: number;
  } | null;
  longest_commit_streak_days: number;
}

export interface PullRequestAnalyticsResponse {
  total_prs: number;
  merged: number;
  open: number;
  closed: number;
  merge_rate: number;
  average_merge_time_hours: number;
  average_review_time_hours: number;
  pending_reviews: number;
}

export interface BranchAnalyticsResponse {
  default_branch: string;
  active_branches: number;
  merged_branches: number;
  recently_created_branches: number;
  stale_branches: number;
}

export interface ContributorItem {
  contributor: string;
  commit_count: number;
  pr_count: number;
  contribution_percentage: number;
  avatar_url?: string | null;
}

export interface ContributorsAnalyticsResponse {
  contributors: ContributorItem[];
  total_contributors: number;
}

export interface WeeklyActivityDay {
  day: string;
  commits: number;
  prs: number;
}

export interface WeeklyActivityResponse {
  days: WeeklyActivityDay[];
}

export interface CodeChurnResponse {
  lines_added: number;
  lines_deleted: number;
  files_changed: number;
  average_files_per_commit: number;
  largest_commit?: any;
  smallest_commit?: any;
}

export interface SyncHealthResponse {
  webhook_status: string;
  last_sync?: string | null;
  average_sync_duration_seconds: number;
  failed_sync_count: number;
  retry_count: number;
  success_rate: number;
  queue_status: string;
}

export interface DashboardAnalyticsResponse {
  overview: RepositoryOverviewResponse;
  commits: CommitAnalyticsResponse;
  pull_requests: PullRequestAnalyticsResponse;
  branches: BranchAnalyticsResponse;
  contributors: ContributorsAnalyticsResponse;
  weekly_activity: WeeklyActivityResponse;
  code_churn: CodeChurnResponse;
  sync_health: SyncHealthResponse;
}

export async function getDashboardAnalytics(projectId: string): Promise<DashboardAnalyticsResponse> {
  return api(`/github/analytics/dashboard/${projectId}`, { method: 'GET' });
}

export async function getAnalyticsOverview(projectId: string): Promise<RepositoryOverviewResponse> {
  return api(`/github/analytics/overview/${projectId}`, { method: 'GET' });
}

export async function getAnalyticsSyncHealth(projectId: string): Promise<SyncHealthResponse> {
  return api(`/github/analytics/sync-health/${projectId}`, { method: 'GET' });
}

export interface TaskTraceabilityStatusResponse {
  task_id: string;
  status: string;
  traceability_score_pct: number;
  branch_assigned: boolean;
  commits_count: number;
  pr_linked: boolean;
  merged: boolean;
}

export interface TaskTraceabilityChainResponse {
  task_id: string;
  task_title: string;
  project_id: string;
  branch?: {
    branch_name: string;
    created_at: string;
  } | null;
  commits: Array<{
    id: string;
    commit_sha: string;
    full_sha: string;
    author: string;
    message: string;
    committed_at?: string | null;
  }>;
  pull_request?: {
    id: string;
    pr_number: number;
    status: string;
    merged: boolean;
    review_state: string;
    created_at: string;
  } | null;
  traceability_score_pct: number;
  status: string;
}

export async function getTaskTraceability(taskId: string): Promise<TaskTraceabilityChainResponse> {
  return api(`/github/tasks/${taskId}/traceability`, { method: 'GET' });
}

export async function assignTaskBranch(taskId: string, branchName: string): Promise<TaskTraceabilityStatusResponse> {
  return api(`/github/tasks/${taskId}/branch`, {
    method: 'POST',
    body: JSON.stringify({ branch_name: branchName }),
  });
}

export async function linkTaskCommit(taskId: string, commitSha: string): Promise<TaskTraceabilityStatusResponse> {
  return api(`/github/tasks/${taskId}/commit`, {
    method: 'POST',
    body: JSON.stringify({ commit_sha: commitSha }),
  });
}

export async function linkTaskPullRequest(taskId: string, prNumber: number): Promise<TaskTraceabilityStatusResponse> {
  return api(`/github/tasks/${taskId}/pull-request`, {
    method: 'POST',
    body: JSON.stringify({ pr_number: prNumber }),
  });
}

export async function unlinkTaskPullRequest(taskId: string): Promise<{ unlinked: boolean; message: string }> {
  return api(`/github/tasks/${taskId}/pull-request`, { method: 'DELETE' });
}

export async function autoLinkTaskEvidence(taskId: string): Promise<TaskTraceabilityStatusResponse> {
  return api(`/github/tasks/${taskId}/auto-link`, { method: 'POST' });
}

export async function getTaskTraceabilityStatus(taskId: string): Promise<TaskTraceabilityStatusResponse> {
  return api(`/github/tasks/${taskId}/status`, { method: 'GET' });
}

export interface EvidenceRecordDTO {
  id: string;
  project_id: string;
  student_id: string;
  identity_id: string;
  source: string;
  artifact_type: string;
  artifact_reference: string;
  origin: string;
  created_from: string;
  status: string;
  decision: string;
  confidence: number;
  confidence_explanation?: Record<string, any> | null;
  version: number;
  created_at: string;
}

export interface EvidenceLinkDTO {
  id: string;
  evidence_a_id: string;
  evidence_b_id: string;
  relationship: string;
  confidence: number;
  version: number;
  created_at: string;
}

export interface EvidenceBundleDTO {
  task_id: string;
  task_title: string;
  project_id: string;
  version: number;
  status: string;
  completion_pct: number;
  records: EvidenceRecordDTO[];
  links: EvidenceLinkDTO[];
  skills: Array<Record<string, any>>;
  updated_at: string;
}

export interface EvidenceStoreSummaryResponse {
  project_id: string;
  total_identities: number;
  total_records: number;
  total_links: number;
  total_events: number;
}

export async function getTaskEvidenceBundle(taskId: string): Promise<EvidenceBundleDTO> {
  return api(`/evidence-graph/task/${taskId}`, { method: 'GET' });
}

export async function getProjectEvidenceSummary(projectId: string): Promise<EvidenceStoreSummaryResponse> {
  return api(`/evidence-graph/project/${projectId}`, { method: 'GET' });
}

export async function collectProjectEvidence(projectId: string): Promise<EvidenceRecordDTO[]> {
  return api(`/evidence-graph/collect/${projectId}`, { method: 'POST' });
}

export async function createEvidenceLink(taskId: string, payload: { evidence_a_id: string; evidence_b_id: string; relationship: string; confidence?: number }): Promise<EvidenceLinkDTO> {
  return api(`/evidence-graph/task/${taskId}/link`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function confirmEvidenceDecision(evidenceId: string, decision: 'approved' | 'rejected' | 'ignored', reason?: string): Promise<EvidenceRecordDTO> {
  return api(`/evidence-graph/record/${evidenceId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ decision, reason }),
  });
}

export interface ProjectEvaluationResponse {
  id: string;
  project_id: string;
  overall_score: number;
  architecture_score: number;
  code_quality_score: number;
  testing_score: number;
  security_score: number;
  collaboration_score: number;
  strengths: string[];
  weaknesses: string[];
  resume_bullets: string[];
  linkedin_summary: string;
  interview_questions: Array<{ question: string; suggested_answer: string }>;
  badge_level: string;
  eval_version: string;
  model_name: string;
  created_at: string;
}

export async function getProjectEvaluation(projectId: string): Promise<ProjectEvaluationResponse> {
  return api(`/evaluation/projects/${projectId}`, { method: 'GET' });
}

export async function triggerProjectEvaluation(projectId: string): Promise<ProjectEvaluationResponse> {
  return api(`/evaluation/projects/${projectId}`, { method: 'POST' });
}




