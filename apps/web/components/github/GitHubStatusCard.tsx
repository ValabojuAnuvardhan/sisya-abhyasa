'use client';

import React from 'react';
import { GitHubStatusResponse } from '@/lib/api';

interface GitHubStatusCardProps {
  status: GitHubStatusResponse | null;
  loading: boolean;
  actionLoading: boolean;
  onRefresh: () => void;
  onDisconnect: () => void;
  onConnect: () => void;
}

export function GitHubStatusCard({
  status,
  loading,
  actionLoading,
  onRefresh,
  onDisconnect,
  onConnect,
}: GitHubStatusCardProps) {
  if (loading) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#6b7280',
          fontSize: '14px',
        }}
      >
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #3b82f6', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
        <span>Checking GitHub connection status...</span>
      </div>
    );
  }

  if (!status?.connected) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4b5563',
            }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
              GitHub Not Connected
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0 0' }}>
              Connect your account to link repositories and import verified Proof-of-Work evidence.
            </p>
          </div>
        </div>

        <button
          onClick={onConnect}
          disabled={actionLoading}
          style={{
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '600',
            backgroundColor: '#111827',
            color: '#ffffff',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {actionLoading ? 'Connecting...' : 'Connect GitHub'}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '16px',
            flexShrink: 0,
          }}
        >
          ✓
        </div>

        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
            GitHub Connected
          </h3>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="#4b5563">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Connected as <strong>@{status.username}</strong></span>
          </p>
        </div>
      </div>

      <button
        onClick={onDisconnect}
        disabled={actionLoading}
        style={{
          padding: '8px 18px',
          fontSize: '13px',
          fontWeight: '600',
          backgroundColor: '#ffffff',
          color: '#ef4444',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Disconnect
      </button>
    </div>
  );
}
