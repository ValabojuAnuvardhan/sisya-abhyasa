'use client';

import React, { useEffect, useState } from 'react';
import {
  TaskTraceabilityChainResponse,
  getTaskTraceability,
  assignTaskBranch,
  linkTaskCommit,
  linkTaskPullRequest,
  unlinkTaskPullRequest,
  autoLinkTaskEvidence,
} from '@/lib/api';

interface TaskTraceabilityCardProps {
  taskId: string;
}

export function TaskTraceabilityCard({ taskId }: TaskTraceabilityCardProps) {
  const [chain, setChain] = useState<TaskTraceabilityChainResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [branchInput, setBranchInput] = useState<string>('');
  const [showBranchForm, setShowBranchForm] = useState<boolean>(false);

  const [commitInput, setCommitInput] = useState<string>('');
  const [showCommitForm, setShowCommitForm] = useState<boolean>(false);

  const [prInput, setPrInput] = useState<string>('');
  const [showPrForm, setShowPrForm] = useState<boolean>(false);

  const fetchTraceability = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await getTaskTraceability(id);
      setChain(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load task traceability chain');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!taskId) return;
    const tid = taskId;
    fetchTraceability(tid);
  }, [taskId]);

  const handleAssignBranch = async () => {
    if (!branchInput.trim()) return;
    setActionLoading(true);
    try {
      await assignTaskBranch(taskId, branchInput.trim());
      setBranchInput('');
      setShowBranchForm(false);
      await fetchTraceability(taskId);
    } catch (e: any) {
      alert(e.message || 'Failed to assign branch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLinkCommit = async () => {
    if (!commitInput.trim()) return;
    setActionLoading(true);
    try {
      await linkTaskCommit(taskId, commitInput.trim());
      setCommitInput('');
      setShowCommitForm(false);
      await fetchTraceability(taskId);
    } catch (e: any) {
      alert(e.message || 'Failed to link commit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLinkPR = async () => {
    const num = parseInt(prInput.trim(), 10);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid pull request number');
      return;
    }
    setActionLoading(true);
    try {
      await linkTaskPullRequest(taskId, num);
      setPrInput('');
      setShowPrForm(false);
      await fetchTraceability(taskId);
    } catch (e: any) {
      alert(e.message || 'Failed to link pull request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlinkPR = async () => {
    if (!confirm('Are you sure you want to unlink this pull request?')) return;
    setActionLoading(true);
    try {
      await unlinkTaskPullRequest(taskId);
      await fetchTraceability(taskId);
    } catch (e: any) {
      alert(e.message || 'Failed to unlink pull request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoDetect = async () => {
    setActionLoading(true);
    try {
      await autoLinkTaskEvidence(taskId);
      await fetchTraceability(taskId);
    } catch (e: any) {
      alert(e.message || 'Auto-detection completed or no candidates found');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>Loading Task ↔ PR Traceability Chain...</p>
      </div>
    );
  }

  const score = chain?.traceability_score_pct ?? 0;
  const statusLabel = chain?.status ?? 'Not Started';

  let badgeColor = '#6b7280';
  let badgeBg = '#f3f4f6';
  let progressColor = '#9ca3af';

  if (score >= 100) {
    badgeColor = '#065f46';
    badgeBg = '#d1fae5';
    progressColor = '#059669';
  } else if (score >= 75) {
    badgeColor = '#1e40af';
    badgeBg = '#dbeafe';
    progressColor = '#2563eb';
  } else if (score >= 25) {
    badgeColor = '#9a3412';
    badgeBg = '#ffedd5';
    progressColor = '#ea580c';
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header & Score Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>🔗</span>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>
                Task ↔ PR Traceability
              </h3>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
                Verified Git proof chain linking task execution to codebase pull requests.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '4px 10px',
                borderRadius: '9999px',
                backgroundColor: badgeBg,
                color: badgeColor,
              }}
            >
              {statusLabel} ({score}%)
            </span>

            <button
              onClick={handleAutoDetect}
              disabled={actionLoading}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>✨ Auto-Detect Evidence</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${score}%`,
              height: '100%',
              backgroundColor: progressColor,
              borderRadius: '9999px',
              transition: 'width 0.4s ease',
            }}
          ></div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '12px' }}>
          {error}
        </div>
      )}

      {/* 3-Row Evidence Chain Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Row 1: Git Branch */}
        <div
          style={{
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #f3f4f6',
            backgroundColor: '#fafafa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>⎇</span>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>
                Assigned Branch
              </span>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', fontFamily: 'monospace', marginTop: '2px' }}>
                {chain?.branch?.branch_name ? (
                  <span style={{ color: '#059669' }}>✓ {chain.branch.branch_name}</span>
                ) : (
                  <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>No branch assigned</span>
                )}
              </div>
            </div>
          </div>

          {!chain?.branch && !showBranchForm && (
            <button
              onClick={() => setShowBranchForm(true)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Assign Branch
            </button>
          )}

          {showBranchForm && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={branchInput}
                onChange={(e) => setBranchInput(e.target.value)}
                placeholder="e.g. feature/auth-system"
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontFamily: 'monospace',
                }}
              />
              <button
                onClick={handleAssignBranch}
                disabled={actionLoading}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={() => setShowBranchForm(false)}
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Row 2: Linked Commits */}
        <div
          style={{
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #f3f4f6',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>⚡</span>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>
                  Linked Commits ({chain?.commits?.length || 0})
                </span>
              </div>
            </div>

            {!showCommitForm && (
              <button
                onClick={() => setShowCommitForm(true)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                + Link Commit
              </button>
            )}
          </div>

          {showCommitForm && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={commitInput}
                onChange={(e) => setCommitInput(e.target.value)}
                placeholder="Commit SHA (e.g. a1b2c3d)"
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontFamily: 'monospace',
                  width: '200px',
                }}
              />
              <button
                onClick={handleLinkCommit}
                disabled={actionLoading}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Link
              </button>
              <button
                onClick={() => setShowCommitForm(false)}
                style={{
                  padding: '6px 10px',
                  fontSize: '12px',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {chain?.commits && chain.commits.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              {chain.commits.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#2563eb' }}>
                      {c.commit_sha}
                    </span>
                    <span style={{ color: '#374151', fontWeight: '500' }}>{c.message}</span>
                  </div>
                  <span style={{ color: '#6b7280', fontSize: '11px' }}>by {c.author}</span>
                </div>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>No commits linked yet</span>
          )}
        </div>

        {/* Row 3: Linked Pull Request */}
        <div
          style={{
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #f3f4f6',
            backgroundColor: '#fafafa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>⑂</span>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>
                Linked Pull Request
              </span>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginTop: '2px' }}>
                {chain?.pull_request ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#2563eb', fontWeight: 'bold' }}>PR #{chain.pull_request.pr_number}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: chain.pull_request.merged ? '#d1fae5' : '#dbeafe',
                        color: chain.pull_request.merged ? '#065f46' : '#1e40af',
                        fontWeight: 'bold',
                        textTransform: 'capitalize',
                      }}
                    >
                      {chain.pull_request.merged ? 'Merged' : chain.pull_request.status}
                    </span>
                  </span>
                ) : (
                  <span style={{ color: '#9ca3af', fontWeight: 'normal' }}>No pull request linked</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {chain?.pull_request ? (
              <button
                onClick={handleUnlinkPR}
                disabled={actionLoading}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: '#ffffff',
                  color: '#ef4444',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Unlink PR
              </button>
            ) : (
              !showPrForm && (
                <button
                  onClick={() => setShowPrForm(true)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Link PR
                </button>
              )
            )}

            {showPrForm && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={prInput}
                  onChange={(e) => setPrInput(e.target.value)}
                  placeholder="PR # (e.g. 1)"
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    width: '100px',
                  }}
                />
                <button
                  onClick={handleLinkPR}
                  disabled={actionLoading}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Link
                </button>
                <button
                  onClick={() => setShowPrForm(false)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    color: '#6b7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
