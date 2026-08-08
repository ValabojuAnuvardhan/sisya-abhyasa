'use client';

import React from 'react';
import { ProjectRepositoryResponse } from '@/lib/api';

interface LinkedRepositoryCardProps {
  linkedData: ProjectRepositoryResponse | null;
  projectName?: string;
  actionLoading?: boolean;
  onSync: () => void;
  onChangeRepo: () => void;
  onUnlink: () => void;
}

export function LinkedRepositoryCard({
  linkedData,
  projectName,
  actionLoading = false,
  onSync,
  onChangeRepo,
  onUnlink,
}: LinkedRepositoryCardProps) {
  if (!linkedData?.linked || !linkedData.repository) return null;

  const repo = linkedData.repository;

  return (
    <div
      style={{
        backgroundColor: '#111827',
        border: '1px solid rgba(30, 58, 138, 0.6)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid #1f2937',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                padding: '2px 10px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: '#064e3b',
                color: '#6ee7b7',
                border: '1px solid #047857',
              }}
            >
              ✓ Repository Linked
            </span>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>
              Linked to: {projectName || 'Project'}
            </span>
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', margin: '4px 0 0 0' }}>
            <a
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#ffffff', textDecoration: 'none' }}
            >
              {repo.full_name}
            </a>
          </h3>

          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '4px 0 0 0' }}>
            {repo.description || 'No description provided for this repository.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={onSync}
            disabled={actionLoading}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              backgroundColor: '#1f2937',
              color: '#ffffff',
              border: '1px solid #374151',
              cursor: 'pointer',
            }}
          >
            Sync Repository
          </button>

          <button
            onClick={onChangeRepo}
            disabled={actionLoading}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              backgroundColor: '#1f2937',
              color: '#ffffff',
              border: '1px solid #374151',
              cursor: 'pointer',
            }}
          >
            Change Repository
          </button>

          <button
            onClick={onUnlink}
            disabled={actionLoading}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              backgroundColor: 'rgba(127, 29, 29, 0.6)',
              color: '#fecaca',
              border: '1px solid #991b1b',
              cursor: 'pointer',
            }}
          >
            Unlink
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          fontSize: '12px',
          color: '#9ca3af',
        }}
      >
        <div>
          <span style={{ color: '#6b7280', fontWeight: '500', display: 'block' }}>Default Branch</span>
          <span style={{ color: '#e5e7eb', fontFamily: 'monospace', fontWeight: '600' }}>
            {repo.default_branch || 'main'}
          </span>
        </div>

        <div>
          <span style={{ color: '#6b7280', fontWeight: '500', display: 'block' }}>Primary Language</span>
          <span style={{ color: '#e5e7eb', fontWeight: '600' }}>
            {repo.language || 'N/A'}
          </span>
        </div>

        <div>
          <span style={{ color: '#6b7280', fontWeight: '500', display: 'block' }}>Visibility</span>
          <span style={{ color: '#e5e7eb', fontWeight: '600', textTransform: 'capitalize' }}>
            {repo.visibility || 'public'}
          </span>
        </div>

        <div>
          <span style={{ color: '#6b7280', fontWeight: '500', display: 'block' }}>Last Sync</span>
          <span style={{ color: '#e5e7eb', fontWeight: '600' }}>
            {linkedData.updated_at ? new Date(linkedData.updated_at).toLocaleString() : 'Just now'}
          </span>
        </div>
      </div>
    </div>
  );
}
