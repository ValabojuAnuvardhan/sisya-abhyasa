'use client';

import React, { useEffect, useState } from 'react';
import {
  EvidenceBundleDTO,
  getTaskEvidenceBundle,
  collectProjectEvidence,
  confirmEvidenceDecision,
} from '@/lib/api';

interface EvidenceGraphCardProps {
  taskId: string;
  projectId?: string;
}

export function EvidenceGraphCard({ taskId, projectId }: EvidenceGraphCardProps) {
  const [bundle, setBundle] = useState<EvidenceBundleDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchBundle = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await getTaskEvidenceBundle(id);
      setBundle(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load evidence graph bundle');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!taskId) return;
    const tid = taskId;
    fetchBundle(tid);
  }, [taskId]);

  const handleCollectGraph = async () => {
    if (!projectId) return;
    setActionLoading(true);
    try {
      await collectProjectEvidence(projectId);
      await fetchBundle(taskId);
    } catch (e: any) {
      alert(e.message || 'Evidence graph collected');
      await fetchBundle(taskId);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecision = async (evidenceId: string, decision: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      await confirmEvidenceDecision(evidenceId, decision, 'User decision via task workspace');
      await fetchBundle(taskId);
    } catch (e: any) {
      alert(e.message || `Failed to ${decision} evidence record`);
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
        <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>Loading Evidence Graph Bundle...</p>
      </div>
    );
  }

  const records = bundle?.records || [];
  const links = bundle?.links || [];
  const confidence = bundle ? Math.round((bundle.completion_pct || 0)) : 0;

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🌐</span>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>
              Evidence Graph Bundle
            </h3>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
              Immutable artifact store linking code proof, git events, and mentor validations.
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
              backgroundColor: bundle?.status === 'merged' || bundle?.status === 'verified' ? '#d1fae5' : '#dbeafe',
              color: bundle?.status === 'merged' || bundle?.status === 'verified' ? '#065f46' : '#1e40af',
            }}
          >
            Confidence: {confidence}%
          </span>

          {projectId && (
            <button
              onClick={handleCollectGraph}
              disabled={actionLoading}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: '#ffffff',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>🔄 Sync Graph</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '12px' }}>
          {error}
        </div>
      )}

      {/* Graph Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fafafa', border: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', fontWeight: '500' }}>Artifact Records</span>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>{records.length}</span>
        </div>

        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fafafa', border: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', fontWeight: '500' }}>Typed Links</span>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>{links.length}</span>
        </div>

        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fafafa', border: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: '11px', color: '#6b7280', display: 'block', fontWeight: '500' }}>Bundle Version</span>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>v{bundle?.version || 1}</span>
        </div>
      </div>

      {/* Evidence Records List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Graph Artifact Records ({records.length})
        </h4>

        {records.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {records.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      backgroundColor: r.source === 'github' ? '#f3f4f6' : '#ecfdf5',
                      color: r.source === 'github' ? '#111827' : '#047857',
                      textTransform: 'uppercase',
                    }}
                  >
                    {r.source}
                  </span>

                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827', fontFamily: 'monospace' }}>
                      {r.artifact_type}: {r.artifact_reference.slice(0, 20)}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b7280', display: 'block' }}>
                      Created from: {r.created_from} · Confidence: {Math.round(r.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: r.decision === 'approved' ? '#d1fae5' : r.decision === 'rejected' ? '#fee2e2' : '#fef3c7',
                      color: r.decision === 'approved' ? '#065f46' : r.decision === 'rejected' ? '#991b1b' : '#92400e',
                      textTransform: 'capitalize',
                    }}
                  >
                    {r.decision}
                  </span>

                  {r.decision === 'pending' && (
                    <>
                      <button
                        onClick={() => handleDecision(r.id, 'approved')}
                        disabled={actionLoading}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleDecision(r.id, 'rejected')}
                        disabled={actionLoading}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        ✗ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
            No graph artifact records generated yet. Click "Sync Graph" to aggregate repository evidence!
          </p>
        )}
      </div>
    </div>
  );
}
