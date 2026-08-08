'use client';

import React from 'react';
import { GithubRepositoryItem, ProjectItem } from '@/lib/api';

interface RepositoryConfirmModalProps {
  isOpen: boolean;
  project: ProjectItem | null;
  repository: GithubRepositoryItem | null;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RepositoryConfirmModal({
  isOpen,
  project,
  repository,
  loading = false,
  onConfirm,
  onCancel,
}: RepositoryConfirmModalProps) {
  if (!isOpen || !project || !repository) return null;

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
          maxWidth: '460px',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          color: '#ffffff',
        }}
      >
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Link Repository?</h3>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px', margin: 0 }}>
            Confirm connecting this GitHub repository to your Śiṣya project.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#030712',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '13px',
          }}
        >
          <div>
            <span style={{ color: '#6b7280', display: 'block', fontSize: '11px', fontWeight: 'bold' }}>PROJECT</span>
            <span style={{ color: '#ffffff', fontWeight: '700' }}>{project.title}</span>
          </div>

          <div style={{ height: '1px', backgroundColor: '#1f2937' }}></div>

          <div>
            <span style={{ color: '#6b7280', display: 'block', fontSize: '11px', fontWeight: 'bold' }}>REPOSITORY</span>
            <span style={{ color: '#60a5fa', fontFamily: 'monospace', fontWeight: '700' }}>{repository.full_name}</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '4px' }}>
          <button
            onClick={onCancel}
            disabled={loading}
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
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Linking...' : 'Confirm & Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
