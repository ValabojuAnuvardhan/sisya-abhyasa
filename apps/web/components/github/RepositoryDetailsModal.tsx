'use client';

import React from 'react';
import { GithubRepositoryItem } from '@/lib/api';

interface RepositoryDetailsModalProps {
  repository: GithubRepositoryItem | null;
  onClose: () => void;
  onLink?: (repoId: string) => void;
  isLinked?: boolean;
}

export function RepositoryDetailsModal({
  repository,
  onClose,
  onLink,
  isLinked = false,
}: RepositoryDetailsModalProps) {
  if (!repository) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#111827',
          border: '1px solid #374151',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: repository.visibility === 'private' ? '#374151' : '#1e3a8a',
                color: repository.visibility === 'private' ? '#d1d5db' : '#93c5fd',
              }}
            >
              {repository.visibility}
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '8px 0 0 0' }}>
              {repository.repo_name}
            </h3>
            <p style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace', margin: '2px 0 0 0' }}>
              {repository.full_name}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '14px', color: '#d1d5db', margin: 0, lineHeight: 1.5 }}>
          {repository.description || 'No description provided for this repository.'}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            backgroundColor: '#030712',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #1f2937',
            fontSize: '12px',
          }}
        >
          <div>
            <span style={{ color: '#6b7280', display: 'block' }}>Owner</span>
            <span style={{ color: '#ffffff', fontWeight: '600' }}>{repository.owner}</span>
          </div>

          <div>
            <span style={{ color: '#6b7280', display: 'block' }}>Language</span>
            <span style={{ color: '#ffffff', fontWeight: '600' }}>{repository.language || 'N/A'}</span>
          </div>

          <div>
            <span style={{ color: '#6b7280', display: 'block' }}>Default Branch</span>
            <span style={{ color: '#ffffff', fontFamily: 'monospace' }}>{repository.default_branch}</span>
          </div>

          <div>
            <span style={{ color: '#6b7280', display: 'block' }}>Stars / Forks</span>
            <span style={{ color: '#ffffff', fontWeight: '600' }}>★ {repository.stars} | ⑂ {repository.forks}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
          <a
            href={repository.html_url}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#60a5fa', fontSize: '13px', textDecoration: 'underline' }}
          >
            View on GitHub ↗
          </a>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                borderRadius: '8px',
                backgroundColor: '#1f2937',
                color: '#ffffff',
                border: '1px solid #374151',
                cursor: 'pointer',
              }}
            >
              Close
            </button>

            {onLink && !isLinked && (
              <button
                onClick={() => {
                  onLink(repository.github_repo_id);
                  onClose();
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '8px',
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
    </div>
  );
}
