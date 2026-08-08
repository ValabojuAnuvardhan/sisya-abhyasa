'use client';

import React from 'react';

interface RepositorySearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  isChanging?: boolean;
  onCancelChange?: () => void;
}

export function RepositorySearch({
  query,
  onQueryChange,
  isChanging = false,
  onCancelChange,
}: RepositorySearchProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div style={{ width: '380px', maxWidth: '100%' }}>
        <input
          type="text"
          placeholder="Search repositories (name, owner, language, description)..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: '14px',
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            color: '#ffffff',
            outline: 'none',
          }}
        />
      </div>

      {isChanging && onCancelChange && (
        <button
          onClick={onCancelChange}
          style={{
            fontSize: '12px',
            color: '#9ca3af',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Cancel Change
        </button>
      )}
    </div>
  );
}
