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

