'use client';

import React from 'react';

interface RepositoryEmptyStateProps {
  query?: string;
  onClearSearch: () => void;
}

export function RepositoryEmptyState({ query, onClearSearch }: RepositoryEmptyStateProps) {
  return (
    <div
      style={{
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '40px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          color: '#9ca3af',
        }}
      >
        🔍
      </div>
      <h4 style={{ color: '#ffffff', fontWeight: '700', fontSize: '16px', margin: 0 }}>
        No repositories found.
      </h4>
      <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0, maxWidth: '400px' }}>
        {query
          ? `No repositories matched your search for "${query}". Try adjusting your filters or search terms.`
          : 'Choose a repository to start collecting evidence or connect a GitHub account.'}
      </p>

      {query && (
        <button
          onClick={onClearSearch}
          style={{
            marginTop: '8px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: '600',
            backgroundColor: '#1f2937',
            color: '#ffffff',
            border: '1px solid #374151',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Clear Search
        </button>
      )}
    </div>
  );
}
