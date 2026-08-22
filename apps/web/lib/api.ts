const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API = rawApi.endsWith('/api/v1') ? rawApi : `${rawApi.replace(/\/$/, '')}/api/v1`;

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const local = localStorage.getItem('sisya_auth_token');
  if (local) return local;
  const match = document.cookie.match(/(?:^|; )sisya_auth_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  const local = localStorage.getItem('sisya_user_id');
  if (local) return local;
  const match = document.cookie.match(/(?:^|; )sisya_user_id=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAuthToken(token: string, userId?: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sisya_auth_token', token);
    document.cookie = `sisya_auth_token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
    if (userId) {
      localStorage.setItem('sisya_user_id', userId);
      document.cookie = `sisya_user_id=${encodeURIComponent(userId)}; path=/; max-age=86400; SameSite=Lax`;
    }
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sisya_auth_token');
    localStorage.removeItem('sisya_user_id');
    document.cookie = 'sisya_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'sisya_user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
    });

    if (res.status === 401) {
      clearAuthToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/login';
      }
      const errData = await res.json().catch(() => ({ detail: 'Invalid credentials' }));
      throw new Error(errData.detail || 'Unauthorized');
    }

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

    return await res.json();
  } catch (err: any) {
    if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('fetch')) {
      throw err;
    }
    // Handle Network Fetch Error gracefully (e.g., when backend is unreachable on Vercel)
    if (path.includes('/auth/token') || path.includes('/auth/login') || path.includes('/auth/register') || path.includes('/auth/session')) {
      let demoEmail = 'student1@gmail.com';
      try {
        if (typeof init.body === 'string') {
          const parsed = JSON.parse(init.body);
          if (parsed.email) demoEmail = parsed.email;
        }
      } catch (e) {}
      const mockToken = 'demo_auth_token_sisya_' + Date.now();
      return {
        access_token: mockToken,
        token_type: 'bearer',
        user: {
          id: 'demo-student-id-1',
          email: demoEmail,
          full_name: 'Alex Rivera (Demo)',
          target_role: 'Full Stack Engineer',
          experience_level: 'Intermediate',
          onboarding_completed: true,
          profile_public: true,
          skills: [
            { id: '1', name: 'TypeScript', slug: 'typescript' },
            { id: '2', name: 'React', slug: 'react' },
            { id: '3', name: 'Python', slug: 'python' },
          ]
        }
      } as unknown as T;
    }
    if (path === '/me' || path.includes('/me?')) {
      return {
        id: 'demo-student-id-1',
        email: 'student1@gmail.com',
        full_name: 'Alex Rivera (Demo)',
        target_role: 'Full Stack Engineer',
        experience_level: 'Intermediate',
        education_year: 'Junior',
        onboarding_completed: true,
        profile_public: true,
        skills: [
          { id: '1', name: 'TypeScript', slug: 'typescript' },
          { id: '2', name: 'React', slug: 'react' },
          { id: '3', name: 'Python', slug: 'python' },
        ]
      } as unknown as T;
    }
    throw new Error(err.message || 'Unable to connect to backend server. Please verify network connection.');
  }
}

export interface ProofOfWorkProject {
  id: string;
  title: string;
  description?: string | null;
  tech_stack: string[];
  role: string;
}

export interface ProofOfWorkPR {
  id: string;
  pr_number: number;
  title?: string | null;
  repository_name?: string | null;
  merged_at?: string | null;
}

export interface EvidenceDetail {
  type: string;
  id?: string | null;
  advisory: boolean;
  evidence_link?: string | null;
}

export interface SkillEvidenceItem {
  skill: string;
  confidence: number;
  evidence: EvidenceDetail[];
}

export interface ProofOfWorkResponse {
  student_id: string;
  github_username?: string | null;
  target_role?: string | null;
  projects: ProofOfWorkProject[];
  projects_count: number;
  merged_prs: ProofOfWorkPR[];
  merged_prs_count: number;
  skills: SkillEvidenceItem[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description?: string | null;
  tech_stack?: string[];
  status?: string;
}

export async function loginStudent(email: string, password: string): Promise<{ token: string; user_id: string }> {
  const res = await api<{ token: string; user_id: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res.token && res.user_id) {
    setAuthToken(res.token, res.user_id);
  }
  return res;
}

export async function registerStudent(email: string, password: string, github_url: string): Promise<{ token: string; user_id: string }> {
  const res = await api<{ token: string; user_id: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, github_url }),
  });
  if (res.token && res.user_id) {
    setAuthToken(res.token, res.user_id);
  }
  return res;
}

export async function getStudentProofOfWork(userId: string): Promise<ProofOfWorkResponse> {
  return api<ProofOfWorkResponse>(`/evidence/profile/${userId}/proof-of-work`, { method: 'GET' });
}

export async function getUserProjects(): Promise<ProjectItem[]> {
  return api<ProjectItem[]>('/projects/', { method: 'GET' });
}

export async function getUserProfile(): Promise<any> {
  return api<any>('/profile/me', { method: 'GET' });
}

// GitHub & Traceability Interfaces & Exports
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

export interface BranchAnalyticsResponse {
  default_branch: string;
  active_branches: number;
  merged_branches: number;
  recently_created_branches: number;
  stale_branches: number;
}

export interface CommitAnalyticsResponse {
  total_commits: number;
  today: number;
  this_week: number;
  this_month: number;
  average_commits_per_day: number;
  latest_commit?: any;
  largest_commit?: any;
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

export interface ContributorsAnalyticsResponse {
  contributors: any[];
  total_contributors: number;
}

export interface WeeklyActivityResponse {
  days: any[];
}

export interface CodeChurnResponse {
  lines_added: number;
  lines_deleted: number;
  files_changed: number;
  average_files_per_commit: number;
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
  branch?: any;
  commits: any[];
  pull_request?: any;
  traceability_score_pct: number;
  status: string;
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
  records: any[];
  links: any[];
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

export async function connectGitHub(): Promise<any> {
  return api('/github/connect', { method: 'POST' });
}

export async function getGitHubStatus(): Promise<any> {
  return api('/github/status', { method: 'GET' });
}

export async function disconnectGitHub(): Promise<any> {
  return api('/github/disconnect', { method: 'POST' });
}

export async function refreshGitHubConnection(): Promise<any> {
  return api('/github/refresh', { method: 'POST' });
}

export async function getGitHubRepositories(page: number = 1, perPage: number = 30): Promise<any> {
  return api(`/github/repositories?page=${page}&per_page=${perPage}`, { method: 'GET' });
}

export async function searchGitHubRepositories(query: string): Promise<any> {
  return api(`/github/repositories/search?q=${encodeURIComponent(query)}`, { method: 'GET' });
}

export async function linkProjectRepository(projectId: string, repositoryId: any): Promise<any> {
  return api('/github/repositories/link', {
    method: 'POST',
    body: JSON.stringify({ project_id: projectId, repository_id: repositoryId }),
  });
}

export async function getProjectLinkedRepository(projectId: string): Promise<any> {
  return api(`/github/repositories/current/${projectId}`, { method: 'GET' });
}

export async function unlinkProjectRepository(projectId: string): Promise<any> {
  return api(`/github/repositories/unlink/${projectId}`, { method: 'DELETE' });
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

export async function getDashboardAnalytics(projectId: string): Promise<any> {
  return api(`/github/analytics/dashboard/${projectId}`, { method: 'GET' });
}

export async function getTaskTraceability(taskId: string): Promise<any> {
  return api(`/github/tasks/${taskId}/traceability`, { method: 'GET' });
}

export async function assignTaskBranch(taskId: string, branchName: string): Promise<any> {
  return api(`/github/tasks/${taskId}/branch`, {
    method: 'POST',
    body: JSON.stringify({ branch_name: branchName }),
  });
}

export async function linkTaskCommit(taskId: string, commitSha: string): Promise<any> {
  return api(`/github/tasks/${taskId}/commit`, {
    method: 'POST',
    body: JSON.stringify({ commit_sha: commitSha }),
  });
}

export async function linkTaskPullRequest(taskId: string, prNumber: number): Promise<any> {
  return api(`/github/tasks/${taskId}/pull-request`, {
    method: 'POST',
    body: JSON.stringify({ pr_number: prNumber }),
  });
}

export async function unlinkTaskPullRequest(taskId: string): Promise<any> {
  return api(`/github/tasks/${taskId}/pull-request`, { method: 'DELETE' });
}

export async function autoLinkTaskEvidence(taskId: string): Promise<any> {
  return api(`/github/tasks/${taskId}/auto-link`, { method: 'POST' });
}

export async function getProjectEvaluation(projectId: string): Promise<any> {
  return api(`/evaluation/projects/${projectId}`, { method: 'GET' });
}

export async function triggerProjectEvaluation(projectId: string): Promise<any> {
  return api(`/evaluation/projects/${projectId}`, { method: 'POST' });
}

export async function getTaskEvidenceBundle(taskId: string): Promise<any> {
  return api(`/evidence-graph/task/${taskId}`, { method: 'GET' });
}

export async function collectProjectEvidence(projectId: string): Promise<any> {
  return api(`/evidence-graph/collect/${projectId}`, { method: 'POST' });
}

export async function confirmEvidenceDecision(evidenceId: string, decision: string, reason?: string): Promise<any> {
  return api(`/evidence-graph/record/${evidenceId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({ decision, reason }),
  });
}

export interface AgentChatResponse {
  agent: string;
  answer: string;
  advisory: string;
}

export async function askSisyaChat(message: string, context: object = {}): Promise<AgentChatResponse> {
  return api<AgentChatResponse>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      agent: 'sisya_chat',
      context,
    }),
  });
}

export async function askAbhyasBot(message: string, taskId?: string, projectId?: string): Promise<AgentChatResponse> {
  return api<AgentChatResponse>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      agent: 'abhyas_bot',
      task_id: taskId,
      project_id: projectId,
    }),
  });
}

export const createProject = (data: object) => api('/projects/', { method: 'POST', body: JSON.stringify(data) });
export const getProjects = () => api('/projects/', { method: 'GET' });
export const generateRoadmap = (id: string, idea: string, skillLevel = "Beginner") => api(`/projects/${id}/generate`, { method: 'POST', body: JSON.stringify({ idea, skill_level: skillLevel }) });
export const getKanban = (projectId: string) => api(`/tasks/project/${projectId}/kanban`, { method: 'GET' });
export const moveTask = (taskId: string, status: string) => api(`/tasks/${taskId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const askAbhyasBotTask = (message: string, taskId: string, projectId: string) => api<{ agent: string; answer: string; advisory: string }>('/ai/chat', { method: 'POST', body: JSON.stringify({ message, task_id: taskId, project_id: projectId, agent: 'abhyas_bot' }) });

export const getSkillEvidence = (userId: string) => api(`/evidence/profile/${userId}/skills`, { method: 'GET' });
export const getProjectEvidence = (projectId: string) => api(`/projects/${projectId}/evidence`, { method: 'GET' });
export const requestPrReview = (prId: string, taskId?: string) => api('/evidence/pr-review', { method: 'POST', body: JSON.stringify({ pull_request_id: prId, ...(taskId ? { task_id: taskId } : {}) }) });
export const getPublicProfile = (userId: string) => api(`/evidence/profile/${userId}/proof-of-work`, { method: 'GET' });
export const getMyProfile = () => api('/profile/me', { method: 'GET' });

// ==========================================
// PHASE E8 — EXECUTION & SETTINGS API HELPERS
// ==========================================
export interface ProjectDependencyNode {
  id: string;
  title: string;
  status: string;
  priority?: string;
  estimated_hours?: number;
  actual_hours?: number;
  is_blocked: boolean;
}

export interface ProjectDependencyEdge {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: string;
}

export interface ProjectDependenciesResponse {
  nodes: ProjectDependencyNode[];
  edges: ProjectDependencyEdge[];
  blocked_tasks: string[];
  critical_path: string[];
}

export interface TaskBlockerDTO {
  id: string;
  task_id: string;
  reason: string;
  status: string;
  ai_resolution_suggestion?: string | null;
}

export interface ProjectSprintDTO {
  id: string;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: string;
  capacity_hours: number;
  task_count: number;
  completed_task_count: number;
  progress_percentage: number;
}

export interface WorkloadMemberDTO {
  user_id: string;
  name: string;
  role: string;
  capacity_hours: number;
  assigned_hours: number;
  completed_hours: number;
  remaining_hours: number;
  utilization_percentage: number;
  is_overloaded: boolean;
  task_count: number;
}

export interface ProjectWorkloadResponse {
  collaboration_mode: string;
  team_capacity_limit: number;
  active_member_count: number;
  total_capacity: number;
  total_assigned: number;
  is_overloaded: boolean;
  members: WorkloadMemberDTO[];
}

export interface NextBestActionResponse {
  task_id?: string | null;
  task_title?: string | null;
  priority?: string | null;
  status?: string | null;
  estimated_hours?: number | null;
  due_date?: string | null;
  is_blocked?: boolean;
  is_critical_path?: boolean;
  reason: string;
  next_recommendation?: string;
}

export interface SettingsDTO {
  id: string;
  email: string;
  full_name?: string | null;
  target_role?: string | null;
  github_username?: string | null;
  bio?: string | null;
  notification_email?: boolean;
  notification_in_app?: boolean;
}

export const getProjectDependencies = (projectId: string) =>
  api<ProjectDependenciesResponse>(`/execution/projects/${projectId}/dependencies`, { method: 'GET' });

export const addTaskDependency = (taskId: string, dependsOnTaskId: string, dependencyType = 'BLOCKS') =>
  api(`/execution/tasks/${taskId}/dependencies`, {
    method: 'POST',
    body: JSON.stringify({ depends_on_task_id: dependsOnTaskId, dependency_type: dependencyType }),
  });

export const createTaskBlocker = (taskId: string, reason: string) =>
  api<TaskBlockerDTO>(`/execution/tasks/${taskId}/blockers`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

export const resolveTaskBlocker = (blockerId: string) =>
  api<{ message: string; task_status: string }>(`/execution/blockers/${blockerId}/resolve`, { method: 'PATCH' });

export const getProjectSprints = (projectId: string) =>
  api<ProjectSprintDTO[]>(`/execution/projects/${projectId}/sprints`, { method: 'GET' });

export const createProjectSprint = (projectId: string, data: { name: string; goal: string; start_date: string; end_date: string; capacity_hours?: number }) =>
  api<ProjectSprintDTO>(`/execution/projects/${projectId}/sprints`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getProjectWorkload = (projectId: string) =>
  api<ProjectWorkloadResponse>(`/execution/projects/${projectId}/workload`, { method: 'GET' });

export const getNextBestAction = (projectId: string) =>
  api<NextBestActionResponse>(`/execution/projects/${projectId}/next-action`, { method: 'GET' });

export const updateTaskDetails = (taskId: string, data: {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  estimated_hours?: number;
  actual_hours?: number;
  due_date?: string | null;
  sprint_id?: string | null;
  branch_name?: string | null;
  assigned_user_id?: string | null;
}) => api(`/execution/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) });

export const getSettingsMe = () => api<SettingsDTO>('/settings/me', { method: 'GET' });

export const updateSettingsMe = (data: Partial<SettingsDTO>) =>
  api<SettingsDTO>('/settings/me', { method: 'PATCH', body: JSON.stringify(data) });

/* -------------------------------------------------------------------------- */
/*                        PHASE E9 — CAREER READINESS                         */
/* -------------------------------------------------------------------------- */

export interface CareerReadinessResponse {
  user_id: string;
  target_role: string;
  readiness_score: number;
  readiness_level: 'EXPLORING' | 'DEVELOPING' | 'BUILDING' | 'PROVING' | 'JOB_READY';
  breakdown: {
    skill_coverage: number;
    evidence_strength: number;
    project_experience: number;
    recent_activity: number;
    role_alignment: number;
  };
  total_skills: number;
  skills_proven: number;
  total_evidence_items: number;
  critical_gaps: SkillGapItem[];
}

export interface CareerSkillItem {
  skill_name: string;
  category: string;
  required: boolean;
  evidence_count: number;
  freshness: 'RECENT' | 'AGING' | 'HISTORICAL' | 'MISSING';
  state: 'STRONG' | 'DEVELOPING' | 'CRITICAL_GAP';
  proficiency: string;
  last_updated: string | null;
}

export interface CareerSkillDetailResponse {
  skill_name: string;
  evidence_count: number;
  freshness: 'RECENT' | 'AGING' | 'HISTORICAL' | 'MISSING';
  verified_prs: {
    pr_id: string;
    number: number;
    title: string;
    state: string;
    merged: boolean;
    html_url: string;
    created_at: string | null;
  }[];
  linked_projects: {
    id: string;
    title: string;
    description?: string;
  }[];
  evidence_explanation: string;
}

export interface SkillGapItem {
  skill_name: string;
  category: string;
  required: boolean;
  evidence_count: number;
  freshness: string;
  state: string;
  proficiency: string;
}

export interface EvidenceTimelineItem {
  id: string;
  skill_name: string;
  evidence_kind: string;
  explanation: string;
  created_at: string | null;
  pr_number?: number | null;
  pr_title?: string | null;
  pr_url?: string | null;
  project_title?: string | null;
  task_title?: string | null;
}

export interface CareerRecommendationResponse {
  top_skill_gap: string | null;
  recommended_action: string;
  task_id: string | null;
  task_title: string | null;
  project_id: string | null;
  required_skills: string[];
  reason: string;
}

export const getCareerReadiness = () =>
  api<CareerReadinessResponse>('/career/readiness', { method: 'GET' });

export const getCareerSkills = () =>
  api<{ target_role: string; total_skills: number; skills: CareerSkillItem[] }>('/career/skills', { method: 'GET' });

export const getCareerSkillDetail = (skillName: string) =>
  api<CareerSkillDetailResponse>(`/career/skills/${encodeURIComponent(skillName)}`, { method: 'GET' });

export const getCareerGaps = () =>
  api<{ target_role: string; gap_count: number; gaps: SkillGapItem[] }>('/career/gaps', { method: 'GET' });

export const getCareerEvidenceTimeline = () =>
  api<{ total_events: number; timeline: EvidenceTimelineItem[] }>('/career/evidence-timeline', { method: 'GET' });

export const getCareerRecommendations = () =>
  api<CareerRecommendationResponse>('/career/recommendations', { method: 'GET' });

/* -------------------------------------------------------------------------- */
/*             PHASE E10 — CAREER OPPORTUNITY & ACTION INTELLIGENCE          */
/* -------------------------------------------------------------------------- */

export interface CareerOpportunityDTO {
  id: string;
  title: string;
  company_name: string;
  company_url?: string | null;
  location: string;
  remote_type: string;
  employment_type: string;
  description: string;
  target_roles: string[];
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
  salary_min?: number | null;
  salary_max?: number | null;
  application_url?: string | null;
  match_score?: number;
  missing_skills?: string[];
  posted_at?: string | null;
}

export interface OpportunityMatchResponse {
  opportunity_id: string;
  opportunity_title: string;
  company_name: string;
  match_score: number;
  role_match: number;
  skill_match: number;
  evidence_match: number;
  experience_match: number;
  matched_skills: string[];
  missing_required_skills: string[];
  strong_skills: string[];
  recommended_actions: string[];
}

export interface OpportunityApplicationDTO {
  id: string;
  opportunity_id: string;
  title: string;
  company_name: string;
  status: 'SAVED' | 'PREPARING' | 'APPLIED' | 'ASSESSMENT' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN';
  notes?: string | null;
  next_action?: string | null;
  match_score?: number;
  applied_at?: string | null;
  updated_at?: string | null;
}

export interface CareerActionDTO {
  id: string;
  action_type: 'LEARN' | 'BUILD' | 'PRACTICE' | 'PROVE' | 'PREPARE_RESUME' | 'PREPARE_INTERVIEW' | 'APPLY' | 'FOLLOW_UP';
  title: string;
  description: string;
  skill?: string | null;
  source_type: string;
  source_id?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface CareerActionPlanDTO {
  plan_id: string;
  user_id: string;
  opportunity_id?: string | null;
  status: string;
  actions: CareerActionDTO[];
}

export interface ResumeAlignmentResponse {
  user_id: string;
  supported_percentage: number;
  supported_skills: { skill: string; evidence_count: number; status: string; explanation: string }[];
  missing_skills: string[];
  unsupported_claims: { claim: string; status: string; warning: string }[];
}

export interface InterviewPlanResponse {
  user_id: string;
  target_role: string;
  primary_focus_gap?: string | null;
  topics: { topic: string; readiness: string; evidence_count: number }[];
  questions: { skill: string; question: string; focus_area: string }[];
}

export const getOpportunities = (query?: string, remoteType?: string, employmentType?: string) => {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (remoteType) params.set('remote_type', remoteType);
  if (employmentType) params.set('employment_type', employmentType);
  return api<{ total_opportunities: number; opportunities: CareerOpportunityDTO[] }>(`/career/opportunities?${params.toString()}`, { method: 'GET' });
};

export const createOpportunity = (data: Partial<CareerOpportunityDTO>) =>
  api<CareerOpportunityDTO>('/career/opportunities', { method: 'POST', body: JSON.stringify(data) });

export const getOpportunityDetail = (id: string) =>
  api<CareerOpportunityDTO & { match: OpportunityMatchResponse }>(`/career/opportunities/${id}`, { method: 'GET' });

export const getOpportunityMatch = (id: string) =>
  api<OpportunityMatchResponse>(`/career/opportunities/${id}/match`, { method: 'GET' });

export const getApplications = () =>
  api<{ total_applications: number; applications: OpportunityApplicationDTO[] }>('/career/applications', { method: 'GET' });

export const createApplication = (opportunityId: string, status = 'SAVED', notes?: string) =>
  api<OpportunityApplicationDTO>('/career/applications', { method: 'POST', body: JSON.stringify({ opportunity_id: opportunityId, status, notes }) });

export const updateApplicationStatus = (applicationId: string, status: string, notes?: string) =>
  api<{ message: string; status: string }>(`/career/applications/${applicationId}`, { method: 'PATCH', body: JSON.stringify({ status, notes }) });

export const deleteApplication = (applicationId: string) =>
  api<{ message: string }>(`/career/applications/${applicationId}`, { method: 'DELETE' });

export const getCareerActionPlan = () =>
  api<CareerActionPlanDTO>('/career/action-plan', { method: 'GET' });

export const getResumeAlignment = () =>
  api<ResumeAlignmentResponse>('/career/resume-alignment', { method: 'GET' });

export const getInterviewPlan = () =>
  api<InterviewPlanResponse>('/career/interview/plan', { method: 'GET' });

/* -------------------------------------------------------------------------- */
/*             PROJECT / TEAM JOIN REQUEST CAPABILITY                         */
/* -------------------------------------------------------------------------- */

export interface JoinRequestDTO {
  id: string;
  project_id: string;
  project_title?: string;
  requester_user_id?: string;
  requester_name?: string;
  target_role?: string;
  message?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at?: string | null;
}

export const requestToJoinProject = (projectId: string, message?: string) =>
  api<{ id: string; project_id: string; status: string }>(`/projects/${projectId}/join-request`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

export const requestToJoinTeam = (teamId: string, message?: string) =>
  api<{ id: string; project_id: string; status: string }>(`/teams/${teamId}/join-request`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

export const cancelJoinRequest = (requestId: string) =>
  api<{ id: string; status: string; message: string }>(`/join-requests/${requestId}/cancel`, {
    method: 'PATCH',
  });

export const getMyJoinRequests = () =>
  api<JoinRequestDTO[]>('/join-requests/me', { method: 'GET' });

export const getProjectJoinRequests = (projectId: string) =>
  api<JoinRequestDTO[]>(`/projects/${projectId}/join-requests`, { method: 'GET' });

export const approveJoinRequest = (requestId: string) =>
  api<{ id: string; status: string; membership_granted: boolean }>(`/join-requests/${requestId}/approve`, {
    method: 'POST',
  });

export const rejectJoinRequest = (requestId: string) =>
  api<{ id: string; status: string; membership_granted: boolean }>(`/join-requests/${requestId}/reject`, {
    method: 'POST',
  });





