'use client';

import React from 'react';
import { GithubRepositoryItem } from '@/lib/api';

interface RepositoryCardProps {
  repository: GithubRepositoryItem;
  isCurrentlyLinked: boolean;
  actionLoading?: boolean;
  onLinkClick: (repo: GithubRepositoryItem) => void;
  onDetailsClick: (repo: GithubRepositoryItem) => void;
}

export function RepositoryCard({
  repository,
  isCurrentlyLinked,
  actionLoading = false,
  onLinkClick,
  onDetailsClick,
}: RepositoryCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#111827',
        border: isCurrentlyLinked ? '1px solid #059669' : '1px solid #1f2937',
        borderRadius: '12px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '14px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
            {repository.repo_name}
          </h4>

          <span
            style={{
              padding: '2px 8px',
              borderRadius: '9999px',
              fontSize: '10px',
              fontWeight: 'bold',
              backgroundColor: repository.visibility === 'private' ? '#374151' : '#1f2937',
              color: repository.visibility === 'private' ? '#d1d5db' : '#9ca3af',
              textTransform: 'capitalize',
            }}
          >
            {repository.visibility || 'Public'}
          </span>
        </div>

        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#9ca3af' }}>
          {repository.full_name}
        </span>

        <p
          style={{
            fontSize: '12px',
            color: '#d1d5db',
            margin: '4px 0 0 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
          }}
        >
          {repository.description || 'No description provided.'}
        </p>
      </div>

      <div
        style={{
          paddingTop: '10px',
          borderTop: '1px solid rgba(31, 41, 55, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#9ca3af',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', flexWrap: 'wrap' }}>
          {repository.language && (
            <span style={{ color: '#d1d5db', fontWeight: '500' }}>
              ● {repository.language}
            </span>
          )}
          <span>⭐ {repository.stars}</span>
          <span>🍴 {repository.forks}</span>
          <span style={{ fontFamily: 'monospace' }}>{repository.default_branch}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onDetailsClick(repository)}
            style={{
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '6px',
              backgroundColor: '#1f2937',
              color: '#d1d5db',
              border: '1px solid #374151',
              cursor: 'pointer',
            }}
          >
            Details
          </button>

          {isCurrentlyLinked ? (
            <button
              disabled
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                backgroundColor: '#064e3b',
                color: '#6ee7b7',
                border: '1px solid #047857',
                cursor: 'default',
              }}
            >
              ✓ Linked
            </button>
          ) : (
            <button
              onClick={() => onLinkClick(repository)}
              disabled={actionLoading}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: '600',
                borderRadius: '6px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Link Repository
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
