'use client';

import React from 'react';
import { ProjectItem } from '@/lib/api';

interface ProjectSelectorProps {
  projects: ProjectItem[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
}

export function ProjectSelector({
  projects,
  selectedProjectId,
  onSelectProject,
}: ProjectSelectorProps) {
  return (
    <div
      style={{
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
          Project Repository Linking
        </h2>
        <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px', margin: 0 }}>
          Connect a Śiṣya project to your GitHub repository to enable verifiable telemetry.
        </p>
      </div>

      <div style={{ width: '280px', maxWidth: '100%' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#d1d5db', marginBottom: '4px' }}>
          Select Project
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) => onSelectProject(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            backgroundColor: '#030712',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#ffffff',
            outline: 'none',
          }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
