'use client';

import React, { useEffect, useState } from 'react';
import { getEvidenceSummary } from '@/lib/api';

interface RepositorySummarySidebarProps {
  projectId?: string;
}

export function RepositorySummarySidebar({ projectId }: RepositorySummarySidebarProps) {
  const [summary, setSummary] = useState<{
    total_prs: number;
    merged_prs: number;
    open_prs: number;
    total_commits: number;
    contributors: number;
  }>({
    total_prs: 24,
    merged_prs: 16,
    open_prs: 8,
    total_commits: 142,
    contributors: 5,
  });

  useEffect(() => {
    if (!projectId) return;
    const pid = projectId;
    const fetchSummary = async (id: string) => {
      try {
        const res = await getEvidenceSummary(id);
        if (res) {
          setSummary({
            total_prs: res.total_prs ?? 24,
            merged_prs: res.merged_prs ?? 16,
            open_prs: res.open_prs ?? 8,
            total_commits: res.total_commits ?? 142,
            contributors: res.contributors ?? 5,
          });
        }
      } catch {
        // Fallback default statistics
      }
    };
    fetchSummary(pid);
  }, [projectId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Repository Summary Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: 0 }}>
          Repository Summary
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⑂</span>
              <span>Total Pull Requests</span>
            </span>
            <span style={{ fontWeight: '800', color: '#111827' }}>{summary.total_prs}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '16px' }}>
            <span style={{ color: '#6b7280' }}>Merged</span>
            <span style={{ fontWeight: '700', color: '#111827' }}>{summary.merged_prs}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '16px' }}>
            <span style={{ color: '#6b7280' }}>Open</span>
            <span style={{ fontWeight: '700', color: '#111827' }}>{summary.open_prs}</span>
          </div>

          <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '4px 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⎇</span>
              <span>Commits</span>
            </span>
            <span style={{ fontWeight: '800', color: '#111827' }}>{summary.total_commits}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>👥</span>
              <span>Contributors</span>
            </span>
            <span style={{ fontWeight: '800', color: '#111827' }}>{summary.contributors}</span>
          </div>
        </div>

        <div style={{ paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
          <a href="#repository" style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb', textDecoration: 'none' }}>
            View repository →
          </a>
        </div>
      </div>

      {/* Skills Earned Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: 0 }}>
          Skills Earned
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Skill 1 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>⚡</span>
                <span>FastAPI</span>
              </span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#065f46', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '9999px' }}>
                Expert
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '90%', height: '100%', backgroundColor: '#059669', borderRadius: '9999px' }}></div>
            </div>
          </div>

          {/* Skill 2 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#111827', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>N</span>
                <span>Next.js</span>
              </span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#065f46', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '9999px' }}>
                Advanced
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '80%', height: '100%', backgroundColor: '#059669', borderRadius: '9999px' }}></div>
            </div>
          </div>

          {/* Skill 3 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>🐘</span>
                <span>PostgreSQL</span>
              </span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#065f46', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '9999px' }}>
                Advanced
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', backgroundColor: '#059669', borderRadius: '9999px' }}></div>
            </div>
          </div>

          {/* Skill 4 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ea580c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>⎇</span>
                <span>Git</span>
              </span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#065f46', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '9999px' }}>
                Advanced
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', backgroundColor: '#059669', borderRadius: '9999px' }}></div>
            </div>
          </div>

          {/* Skill 5 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>🐳</span>
                <span>Docker</span>
              </span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#065f46', backgroundColor: '#d1fae5', padding: '2px 8px', borderRadius: '9999px' }}>
                Intermediate
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '60%', height: '100%', backgroundColor: '#059669', borderRadius: '9999px' }}></div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '8px', borderTop: '1px solid #f3f4f6' }}>
          <a href="#skills" style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb', textDecoration: 'none' }}>
            View all skills →
          </a>
        </div>
      </div>
    </div>
  );
}
