'use client';

import React, { useEffect, useState } from 'react';
import { getEvidenceTimeline, RepositoryOverviewResponse, BranchAnalyticsResponse } from '@/lib/api';

interface TimelineItem {
  type: 'pull_request' | 'commit';
  id: string;
  pr_number?: number;
  sha?: string;
  title: string;
  state: string;
  author: string;
  html_url: string;
  is_verified: boolean;
  date?: string | null;
}

interface EvidenceTimelineProps {
  projectId?: string;
  overview?: RepositoryOverviewResponse | null;
  branches?: BranchAnalyticsResponse | null;
}

export function EvidenceTimeline({ projectId, overview, branches }: EvidenceTimelineProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'prs' | 'commits' | 'branches'>('timeline');
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!projectId) return;
    const pid = projectId;
    const fetchTimeline = async (id: string) => {
      try {
        const res = await getEvidenceTimeline(id);
        if (res && Array.isArray(res.items)) {
          setItems(res.items);
        }
      } catch {
        setItems([]);
      } finally {
        setLoaded(true);
      }
    };
    fetchTimeline(pid);
  }, [projectId]);

  const filteredItems = items.filter((item) => {
    if (activeTab === 'prs') return item.type === 'pull_request';
    if (activeTab === 'commits') return item.type === 'commit';
    return true;
  });

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Tab Navigation Header */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          padding: '0 24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
        }}
      >
        <button
          onClick={() => setActiveTab('timeline')}
          style={{
            padding: '16px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: activeTab === 'timeline' ? '#059669' : '#6b7280',
            borderBottom: activeTab === 'timeline' ? '2px solid #059669' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Evidence Timeline
        </button>

        <button
          onClick={() => setActiveTab('prs')}
          style={{
            padding: '16px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: activeTab === 'prs' ? '#059669' : '#6b7280',
            borderBottom: activeTab === 'prs' ? '2px solid #059669' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Pull Requests {overview ? `(${overview.total_pull_requests})` : ''}
        </button>

        <button
          onClick={() => setActiveTab('commits')}
          style={{
            padding: '16px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: activeTab === 'commits' ? '#059669' : '#6b7280',
            borderBottom: activeTab === 'commits' ? '2px solid #059669' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Commits {overview ? `(${overview.total_commits})` : ''}
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          style={{
            padding: '16px 0',
            fontSize: '13px',
            fontWeight: '600',
            color: activeTab === 'branches' ? '#059669' : '#6b7280',
            borderBottom: activeTab === 'branches' ? '2px solid #059669' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Branches {branches ? `(${branches.active_branches})` : ''}
        </button>
      </div>

      {/* Timeline List Items or Graceful Empty State */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'branches' ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <div>
                <strong style={{ color: '#111827' }}>Default Branch: {branches?.default_branch || 'main'}</strong>
                <span style={{ fontSize: '12px', color: '#6b7280', display: 'block' }}>Primary production branch</span>
              </div>
              <span style={{ padding: '2px 8px', borderRadius: '9999px', backgroundColor: '#d1fae5', color: '#065f46', fontSize: '11px', fontWeight: 'bold' }}>Active</span>
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              <span>Merged Branches: <strong>{branches?.merged_branches || 0}</strong></span> · <span>Stale Branches (&gt;90d): <strong>{branches?.stale_branches || 0}</strong></span>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
            <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#374151', margin: '0 0 4px 0' }}>
              No {activeTab === 'prs' ? 'pull requests' : activeTab === 'commits' ? 'commits' : 'evidence events'} synchronized yet.
            </h4>
            <p style={{ fontSize: '13px', margin: 0 }}>
              Click <strong>Sync</strong> on the linked repository banner above to import live activity.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid #f3f4f6',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: item.is_verified ? '#10b981' : '#f59e0b',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                  }}
                >
                  {item.is_verified ? '✓' : '🕒'}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#2563eb', fontFamily: 'monospace' }}>
                      {item.type === 'pull_request' ? `PR #${item.pr_number}` : `commit ${item.sha}`}
                    </span>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0 }}>
                      {item.title}
                    </h4>
                  </div>

                  <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', display: 'block' }}>
                    {item.state === 'merged' ? 'Merged' : 'Opened'} by {item.author} {item.date ? `· ${item.date}` : ''}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {item.is_verified ? (
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                    }}
                  >
                    Verified
                  </span>
                ) : (
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                    }}
                  >
                    Pending Review
                  </span>
                )}

                <a
                  href={item.html_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>View</span>
                  <span style={{ fontSize: '10px' }}>↗</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Link */}
      <div style={{ padding: '16px 24px', textAlign: 'center', backgroundColor: '#fafafa', borderTop: '1px solid #f3f4f6' }}>
        <a href="#pull-requests" style={{ fontSize: '13px', fontWeight: '600', color: '#2563eb', textDecoration: 'none' }}>
          View all pull requests →
        </a>
      </div>
    </div>
  );
}
