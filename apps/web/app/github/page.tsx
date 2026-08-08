'use client';

import React, { Suspense } from 'react';
import { GitHubEvidence } from '@/components/github/GitHubEvidence';

export default function GitHubPage() {
  return (
    <div style={{ width: '100%' }}>
      <Suspense fallback={<div style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>Loading GitHub Evidence Workspace...</div>}>
        <GitHubEvidence />
      </Suspense>
    </div>
  );
}
