'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  GithubRepositoryItem,
  getGitHubRepositories,
  searchGitHubRepositories,
  getProjectLinkedRepository,
  linkProjectRepository,
  unlinkProjectRepository,
  getUserProjects,
  ProjectItem,
  ProjectRepositoryResponse,
} from '@/lib/api';

import { ProjectSelector } from './ProjectSelector';
import { LinkedRepositoryCard } from './LinkedRepositoryCard';
import { RepositorySearch } from './RepositorySearch';
import { RepositoryGrid } from './RepositoryGrid';
import { RepositorySkeleton } from './RepositorySkeleton';
import { RepositoryEmptyState } from './RepositoryEmptyState';
import { RepositoryConfirmModal } from './RepositoryConfirmModal';
import { RepositoryDetailsModal } from './RepositoryDetailsModal';
import { RepositoryToast } from './RepositoryToast';

interface ProjectRepoSelectorProps {
  hideHeader?: boolean;
}

export function ProjectRepoSelector({ hideHeader = false }: ProjectRepoSelectorProps) {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [repositories, setRepositories] = useState<GithubRepositoryItem[]>([]);
  const [linkedData, setLinkedData] = useState<ProjectRepositoryResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [loadingRepos, setLoadingRepos] = useState<boolean>(true);
  const [loadingLinked, setLoadingLinked] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const [isChanging, setIsChanging] = useState<boolean>(false);
  const [confirmRepo, setConfirmRepo] = useState<GithubRepositoryItem | null>(null);
  const [detailsRepo, setDetailsRepo] = useState<GithubRepositoryItem | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  useEffect(() => {
    async function initProjects() {
      try {
        const list = await getUserProjects();
        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0].id);
        }
      } catch {
        const defaultList: ProjectItem[] = [
          { id: '11111111-1111-1111-1111-111111111111', title: 'AI Resume Builder Project', description: 'Student Capstone Project' },
        ];
        setProjects(defaultList);
        setSelectedProjectId(defaultList[0].id);
      }
    }
    initProjects();
  }, []);

  const fetchRepositories = async (query = '') => {
    setLoadingRepos(true);
    setError(null);
    try {
      if (query.trim()) {
        const res = await searchGitHubRepositories(query.trim());
        setRepositories(res.repositories);
      } else {
        const res = await getGitHubRepositories(1, 50);
        setRepositories(res.repositories);
      }
    } catch (err: any) {
      setError(err.message || 'Could not fetch GitHub repositories.');
    } finally {
      setLoadingRepos(false);
    }
  };

  const fetchLinkedStatus = async (projectId: string) => {
    if (!projectId) return;
    setLoadingLinked(true);
    try {
      const res = await getProjectLinkedRepository(projectId);
      setLinkedData(res);
    } catch {
      setLinkedData({ linked: false, project_id: projectId });
    } finally {
      setLoadingLinked(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchLinkedStatus(selectedProjectId);
    }
  }, [selectedProjectId]);

  const filteredRepositories = useMemo(() => {
    if (!searchQuery.trim()) return repositories;
    const q = searchQuery.toLowerCase().trim();
    return repositories.filter((r) => {
      const matchName = r.repo_name.toLowerCase().includes(q);
      const matchOwner = r.owner.toLowerCase().includes(q);
      const matchLang = r.language ? r.language.toLowerCase().includes(q) : false;
      const matchDesc = r.description ? r.description.toLowerCase().includes(q) : false;
      return matchName || matchOwner || matchLang || matchDesc;
    });
  }, [repositories, searchQuery]);

  const handleConfirmLink = async () => {
    if (!selectedProjectId || !confirmRepo) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await linkProjectRepository(selectedProjectId, confirmRepo.github_repo_id);
      setLinkedData(res);
      setIsChanging(false);
      setConfirmRepo(null);
      showToast(`Repository "${confirmRepo.repo_name}" linked successfully!`);
    } catch (err: any) {
      setError(err.message || 'Failed to link repository.');
      showToast(err.message || 'Failed to link repository.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!selectedProjectId) return;
    setActionLoading(true);
    setError(null);
    try {
      await unlinkProjectRepository(selectedProjectId);
      setLinkedData({ linked: false, project_id: selectedProjectId });
      setIsChanging(false);
      showToast('Repository unlinked from project.');
    } catch (err: any) {
      setError(err.message || 'Failed to unlink repository.');
      showToast(err.message || 'Failed to unlink repository.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSync = async () => {
    if (!selectedProjectId) return;
    setActionLoading(true);
    try {
      await fetchLinkedStatus(selectedProjectId);
      showToast('Repository synchronized successfully!');
    } catch {
      showToast('Failed to sync repository.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId) || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Project Selector Component (optional) */}
      {!hideHeader && (
        <ProjectSelector
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={(id) => setSelectedProjectId(id)}
        />
      )}

      {/* Pinned Linked Repository Summary Card */}
      {loadingLinked ? (
        <RepositorySkeleton count={1} />
      ) : linkedData?.linked && !isChanging && !hideHeader ? (
        <LinkedRepositoryCard
          linkedData={linkedData}
          projectName={currentProject?.title}
          actionLoading={actionLoading}
          onSync={handleSync}
          onChangeRepo={() => setIsChanging(true)}
          onUnlink={handleUnlink}
        />
      ) : null}

      {/* Repository Discovery & Search Section */}
      {(!linkedData?.linked || isChanging || hideHeader) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <RepositorySearch
            query={searchQuery}
            onQueryChange={(q) => setSearchQuery(q)}
            isChanging={isChanging}
            onCancelChange={() => setIsChanging(false)}
          />

          {loadingRepos ? (
            <RepositorySkeleton count={6} />
          ) : filteredRepositories.length === 0 ? (
            <RepositoryEmptyState
              query={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          ) : (
            <RepositoryGrid
              repositories={filteredRepositories}
              currentlyLinkedRepoId={linkedData?.repository?.github_repo_id}
              actionLoading={actionLoading}
              onLinkClick={(repo) => setConfirmRepo(repo)}
              onDetailsClick={(repo) => setDetailsRepo(repo)}
            />
          )}
        </div>
      )}

      {/* Modals & Toast Notifications */}
      <RepositoryConfirmModal
        isOpen={Boolean(confirmRepo)}
        project={currentProject}
        repository={confirmRepo}
        loading={actionLoading}
        onConfirm={handleConfirmLink}
        onCancel={() => setConfirmRepo(null)}
      />

      <RepositoryDetailsModal
        repository={detailsRepo}
        onClose={() => setDetailsRepo(null)}
        onLink={(repoId) => {
          const target = repositories.find((r) => String(r.github_repo_id) === String(repoId));
          if (target) setConfirmRepo(target);
        }}
        isLinked={String(detailsRepo?.github_repo_id) === String(linkedData?.repository?.github_repo_id)}
      />

      <RepositoryToast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
