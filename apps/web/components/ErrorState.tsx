'use client';

import React from 'react';

type ErrorStateProps = {
  title?: string;
  message: string;
  suggestion?: string;
  onRetry?: () => void;
};

export default function ErrorState({
  title = 'Something went wrong',
  message,
  suggestion = 'Please check your connection or attempt the action again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="card error-banner"
      role="alert"
      style={{
        padding: '20px 24px',
        borderLeft: '4px solid var(--danger)',
        background: 'rgba(239, 68, 68, 0.05)',
        margin: '16px 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <span style={{ fontSize: 24, lineHeight: 1 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--danger)', fontWeight: 600 }}>{title}</h3>
          <p style={{ margin: '0 0 6px', fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>{message}</p>
          {suggestion && <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>💡 <em>{suggestion}</em></p>}
        </div>
        {onRetry && (
          <button className="btn secondary" onClick={onRetry} style={{ padding: '6px 14px', fontSize: 13, alignSelf: 'center' }}>
            🔄 Retry
          </button>
        )}
      </div>
    </div>
  );
}
