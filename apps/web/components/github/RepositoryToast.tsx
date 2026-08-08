'use client';

import React from 'react';

interface RepositoryToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function RepositoryToast({ message, type = 'success', onClose }: RepositoryToastProps) {
  if (!message) return null;

  const isError = type === 'error';
  const bgColor = isError ? 'rgba(127, 29, 29, 0.95)' : 'rgba(6, 78, 59, 0.95)';
  const borderColor = isError ? '#991b1b' : '#047857';
  const textColor = isError ? '#fecaca' : '#a7f3d0';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        color: textColor,
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
        fontWeight: '600',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span>{isError ? '✕' : '✓'}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: textColor,
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          marginLeft: '8px',
        }}
      >
        ✕
      </button>
    </div>
  );
}
