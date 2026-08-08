'use client';

import React from 'react';
import { ProjectRepoSelector } from './ProjectRepoSelector';

interface ProjectRepoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectRepoSelectorModal({ isOpen, onClose }: ProjectRepoSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#030712',
          border: '1px solid #1f2937',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
              Select Repository
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '4px 10px',
              fontSize: '13px',
              fontWeight: 'bold',
              backgroundColor: '#1f2937',
              color: '#d1d5db',
              border: '1px solid #374151',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            ✕ Cancel
          </button>
        </div>

        <div style={{ borderTop: '1px solid #1f2937', paddingTop: '16px' }}>
          <ProjectRepoSelector hideHeader={true} />
        </div>
      </div>
    </div>
  );
}
