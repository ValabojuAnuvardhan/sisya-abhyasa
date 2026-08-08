'use client';

import React from 'react';
import { GithubRepositoryItem } from '@/lib/api';
import { RepositoryCard } from './RepositoryCard';

interface RepositoryGridProps {
  repositories: GithubRepositoryItem[];
  currentlyLinkedRepoId?: string | null;
  actionLoading?: boolean;
  onLinkClick: (repo: GithubRepositoryItem) => void;
  onDetailsClick: (repo: GithubRepositoryItem) => void;
}

export function RepositoryGrid({
  repositories,
  currentlyLinkedRepoId,
  actionLoading = false,
  onLinkClick,
  onDetailsClick,
}: RepositoryGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', width: '100%' }}>
      {repositories.map((repo) => (
        <RepositoryCard
          key={repo.github_repo_id}
          repository={repo}
          isCurrentlyLinked={String(repo.github_repo_id) === String(currentlyLinkedRepoId)}
          actionLoading={actionLoading}
          onLinkClick={onLinkClick}
          onDetailsClick={onDetailsClick}
        />
      ))}
    </div>
  );
}
