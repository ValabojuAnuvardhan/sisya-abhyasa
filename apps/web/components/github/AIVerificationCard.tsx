'use client';

import React, { useEffect, useState } from 'react';
import {
  ProjectEvaluationResponse,
  getProjectEvaluation,
  triggerProjectEvaluation,
} from '@/lib/api';

interface AIVerificationCardProps {
  projectId?: string;
}

export function AIVerificationCard({ projectId }: AIVerificationCardProps) {
  const [evaluation, setEvaluation] = useState<ProjectEvaluationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'resume' | 'interview'>('audit');
  const [error, setError] = useState<string>('');

  const fetchEvaluation = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await getProjectEvaluation(id);
      setEvaluation(data);
    } catch {
      // Set evaluation to null so an explicit un-audited empty state renders
      setEvaluation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    const pid = projectId;
    fetchEvaluation(pid);
  }, [projectId]);

  const handleRunAudit = async () => {
    if (!projectId) return;
    setActionLoading(true);
    try {
      const data = await triggerProjectEvaluation(projectId);
      setEvaluation(data);
    } catch (e: any) {
      alert(e.message || 'Failed to trigger AI audit');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <p style={{ color: 'var(--muted)', margin: 0, fontSize: '13px' }}>Evaluating AI Project Verification & Trust Score...</p>
      </div>
    );
  }

  const evalData = evaluation;

  if (!evalData) {
    return (
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--ink)', margin: 0 }}>
            🛡️ AI Verification & Employability Audit
          </h3>
          <p style={{ color: 'var(--muted)', margin: '4px 0 0 0', fontSize: '13px' }}>
            Project not yet audited. Click 'Run AI Verification' to evaluate codebase evidence.
          </p>
        </div>
        <button
          onClick={handleRunAudit}
          disabled={actionLoading}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            backgroundColor: 'var(--mint)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          {actionLoading ? 'Auditing...' : '⚡ Run AI Verification'}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#059669',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
          >
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: 0 }}>
                AI Verification & Employability Audit
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                }}
              >
                {evalData?.badge_level || 'Production Ready'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>
              Reproducible 10-dimension audit powered by <strong style={{ color: '#374151' }}>{evalData?.model_name || 'gemini-3.6-flash'}</strong> (v{evalData?.eval_version || '1.1.0'})
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={actionLoading}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            backgroundColor: '#059669',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          <span>⚡</span>
          <span>{actionLoading ? 'Auditing...' : 'Run AI Verification'}</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: activeTab === 'audit' ? '#059669' : '#6b7280',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'audit' ? '2px solid #059669' : '2px solid transparent',
            paddingBottom: '6px',
            cursor: 'pointer',
          }}
        >
          Employability Audit ({evalData?.overall_score || 94.5}%)
        </button>

        <button
          onClick={() => setActiveTab('resume')}
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: activeTab === 'resume' ? '#059669' : '#6b7280',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'resume' ? '2px solid #059669' : '2px solid transparent',
            paddingBottom: '6px',
            cursor: 'pointer',
          }}
        >
          Resume & LinkedIn Bullets
        </button>

        <button
          onClick={() => setActiveTab('interview')}
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: activeTab === 'interview' ? '#059669' : '#6b7280',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'interview' ? '2px solid #059669' : '2px solid transparent',
            paddingBottom: '6px',
            cursor: 'pointer',
          }}
        >
          Technical Interview Prep
        </button>
      </div>

      {/* Tab Content 1: Employability Audit */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quality Meters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>Architecture</span>
                <span style={{ fontWeight: 'bold', color: '#059669' }}>{evalData?.architecture_score}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${evalData?.architecture_score}%`, height: '100%', backgroundColor: '#059669' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>Code Quality</span>
                <span style={{ fontWeight: 'bold', color: '#059669' }}>{evalData?.code_quality_score}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${evalData?.code_quality_score}%`, height: '100%', backgroundColor: '#059669' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>Security</span>
                <span style={{ fontWeight: 'bold', color: '#059669' }}>{evalData?.security_score}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${evalData?.security_score}%`, height: '100%', backgroundColor: '#059669' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>Testing</span>
                <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{evalData?.testing_score}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${evalData?.testing_score}%`, height: '100%', backgroundColor: '#2563eb' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>Collaboration</span>
                <span style={{ fontWeight: 'bold', color: '#059669' }}>{evalData?.collaboration_score}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: `${evalData?.collaboration_score}%`, height: '100%', backgroundColor: '#059669' }}></div>
              </div>
            </div>
          </div>

          {/* Key Architectural Strengths */}
          <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#166534', margin: '0 0 6px 0' }}>
              ✓ Verified Engineering Strengths
            </h4>
            <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '12px', color: '#14532d', lineHeight: '1.5' }}>
              {evalData?.strengths.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab Content 2: Resume & LinkedIn */}
      {activeTab === 'resume' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', margin: '0 0 8px 0' }}>
              📄 Verified Resume Bullet Points
            </h4>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fafafa', border: '1px solid #e5e7eb' }}>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '12px', color: '#111827', lineHeight: '1.6' }}>
                {evalData?.resume_bullets.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', margin: '0 0 8px 0' }}>
              💼 LinkedIn Portfolio Summary
            </h4>
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
                color: '#374151',
                lineHeight: '1.5',
              }}
            >
              {evalData?.linkedin_summary}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Technical Interview Prep */}
      {activeTab === 'interview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#374151', margin: 0 }}>
            🧠 Codebase-Grounded Technical Interview Questions
          </h4>

          {evalData?.interview_questions.map((q, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                Q{idx + 1}: {q.question}
              </span>
              <p style={{ fontSize: '12px', color: '#4b5563', margin: 0, lineHeight: '1.5', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px' }}>
                <strong>Suggested Answer:</strong> {q.suggested_answer}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
