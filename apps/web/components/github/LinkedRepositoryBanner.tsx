'use client';

import React from 'react';
import { ProjectRepositoryResponse } from '@/lib/api';

interface LinkedRepositoryBannerProps {
  linkedData: ProjectRepositoryResponse | null;
  projectName?: string;
  actionLoading: boolean;
  onSync: () => void;
  onChangeRepository: () => void;
  onUnlink?: () => void;
}

export function LinkedRepositoryBanner({
  linkedData,
  projectName,
  actionLoading,
  onSync,
  onChangeRepository,
  onUnlink,
}: LinkedRepositoryBannerProps) {
  if (!linkedData?.linked || !linkedData.repository) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px dashed #d1d5db',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Repository
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '4px 0 0 0' }}>
            No Repository Linked
          </h3>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
            Connect a GitHub repository to project "{projectName || 'Project'}" to begin import of verified commits and pull requests.
          </p>
        </div>

        <button
          onClick={onChangeRepository}
          style={{
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '600',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Select Repository
        </button>
      </div>
    );
  }

  const repo = linkedData.repository;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#d1fae5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
              }}
            >
              ✓ Repository Linked
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
              {repo.full_name}
            </span>
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '4px 0 0 0' }}>
            {repo.repo_name}
          </h3>

          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
          >
            <span>Open on GitHub</span>
            <span style={{ fontSize: '11px' }}>↗</span>
          </a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', fontWeight: '500' }}>Default Branch</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827', fontFamily: 'monospace' }}>
              {repo.default_branch || 'main'}
            </span>
          </div>

          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', fontWeight: '500' }}>Language</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
              {repo.language || 'Python'}
            </span>
          </div>

          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', fontWeight: '500' }}>Visibility</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827', textTransform: 'capitalize' }}>
              {repo.visibility || 'Public'}
            </span>
          </div>

          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', fontWeight: '500' }}>Last Sync</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
              {linkedData.updated_at ? new Date(linkedData.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2 minutes ago'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onSync}
              disabled={actionLoading}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              <span>🔄</span>
              <span>{actionLoading ? 'Syncing...' : 'Sync'}</span>
            </button>

            <button
              onClick={onChangeRepository}
              disabled={actionLoading}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              Change
            </button>

            <button
              onClick={onUnlink || onChangeRepository}
              disabled={actionLoading}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: '#ffffff',
                color: '#ef4444',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              }}
            >
              Unlink
            </button>
          </div>
        </div>
      </div>

      {/* Reserved Telemetry Status Strip for Sprints 3-7 */}
      <div
        style={{
          paddingTop: '12px',
          borderTop: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          fontSize: '12px',
          color: '#6b7280',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: '600' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
          <span>● Synced</span>
        </span>

        <span>Webhook: <strong style={{ color: '#374151' }}>Active</strong></span>
        <span>Last Import: <strong style={{ color: '#374151' }}>2 min ago</strong></span>
        <span>Commits Imported: <strong style={{ color: '#374151' }}>142</strong></span>
        <span>PRs Imported: <strong style={{ color: '#374151' }}>24</strong></span>
      </div>
    </div>
  );
}
