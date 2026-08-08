'use client';

import React from 'react';

interface RepositorySkeletonProps {
  count?: number;
}

export function RepositorySkeleton({ count = 4 }: RepositorySkeletonProps) {
  const items = Array.from({ length: count });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', width: '100%' }}>
      {items.map((_, i) => (
        <div
          key={i}
          style={{
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '20px',
            height: '140px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            opacity: 0.6,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '40%', height: '14px', backgroundColor: '#1f2937', borderRadius: '4px' }}></div>
            <div style={{ width: '70%', height: '18px', backgroundColor: '#374151', borderRadius: '4px' }}></div>
            <div style={{ width: '90%', height: '12px', backgroundColor: '#1f2937', borderRadius: '4px' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '30%', height: '12px', backgroundColor: '#1f2937', borderRadius: '4px' }}></div>
            <div style={{ width: '25%', height: '28px', backgroundColor: '#2563eb', opacity: 0.3, borderRadius: '8px' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
