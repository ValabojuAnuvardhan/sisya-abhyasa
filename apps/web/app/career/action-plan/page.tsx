'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCareerActionPlan, getResumeAlignment, getInterviewPlan, CareerActionPlanDTO, ResumeAlignmentResponse, InterviewPlanResponse } from '../../../lib/api';

export default function ActionPlanPage() {
  const [plan, setPlan] = useState<CareerActionPlanDTO | null>(null);
  const [resume, setResume] = useState<ResumeAlignmentResponse | null>(null);
  const [interview, setInterview] = useState<InterviewPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, rRes, iRes] = await Promise.all([
        getCareerActionPlan(),
        getResumeAlignment(),
        getInterviewPlan(),
      ]);
      setPlan(pRes);
      setResume(rRes);
      setInterview(iRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load action plan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ backgroundColor: '#f7f2eb', minHeight: 'calc(100vh - 64px)', color: '#1a1410', padding: '32px 16px' }}>
      <main style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* TOP TAB NAV */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 12 }}>
          <Link href="/career" style={{ fontSize: 14, fontWeight: 600, color: '#7a6f67', textDecoration: 'none' }}>Overview</Link>
          <Link href="/career/opportunities" style={{ fontSize: 14, fontWeight: 600, color: '#7a6f67', textDecoration: 'none' }}>Opportunities</Link>
          <Link href="/career/action-plan" style={{ fontSize: 14, fontWeight: 700, color: '#00a19b', borderBottom: '2px solid #00a19b', paddingBottom: 10, textDecoration: 'none' }}>Action Plan</Link>
          <Link href="/career/applications" style={{ fontSize: 14, fontWeight: 600, color: '#7a6f67', textDecoration: 'none' }}>Applications</Link>
        </div>

        {/* HEADER */}
        <header style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6f67', textTransform: 'uppercase' }}>Execution Engine</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '4px 0 0 0', fontFamily: 'Georgia, serif', color: '#1a1410' }}>
              Personalized Career Action Plan
            </h1>
          </div>
          <Link href="/projects" style={{ background: '#00a19b', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            Open Project Board →
          </Link>
        </header>

        {/* ERROR STATE */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: 16, borderRadius: 12, fontSize: 14 }}>
            ⚠️ {error}
            <button onClick={loadData} style={{ marginLeft: 12, fontSize: 12, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: '#991b1b' }}>
              [Try Again]
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div style={{ height: 240, background: 'rgba(0,0,0,0.04)', borderRadius: 16 }} />
        )}

        {!loading && plan && resume && interview && (
          <>
            {/* ACTION PLAN ITEMS */}
            <section style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, fontFamily: 'Georgia, serif', color: '#1a1410' }}>
                🎯 Priority Action Items ({plan.actions.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {plan.actions.map((act) => (
                  <div key={act.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 14, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 8, background: act.priority === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : 'rgba(0,161,155,0.15)', color: act.priority === 'CRITICAL' ? '#dc2626' : '#00a19b' }}>
                          {act.priority}
                        </span>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: '#1a1410' }}>{act.title}</h3>
                      </div>
                      <p style={{ fontSize: 13, color: '#7a6f67', margin: '4px 0 0 0' }}>{act.description}</p>
                    </div>

                    <Link href="/projects" style={{ background: '#1a1410', color: '#fff', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                      Execute Task →
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* RESUME ALIGNMENT ENGINE */}
            <section style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: 'Georgia, serif', color: '#1a1410' }}>
                  📄 Resume Claim Alignment ({resume.supported_percentage}% Verified)
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Verified Resume Skills ({resume.supported_skills.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                    {resume.supported_skills.map((s) => (
                      <div key={s.skill} style={{ fontSize: 13, color: '#1a1410', fontWeight: 600 }}>
                        ✓ {s.skill} <span style={{ fontSize: 11, color: '#7a6f67' }}>({s.explanation})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Unsupported Claims ({resume.unsupported_claims.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                    {resume.unsupported_claims.map((c, idx) => (
                      <div key={idx} style={{ fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
                        ⚠️ {c.claim} <span style={{ fontSize: 11, color: '#7a6f67' }}>({c.warning})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* INTERVIEW PREPARATION */}
            <section style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, fontFamily: 'Georgia, serif', color: '#1a1410' }}>
                💡 Targeted Interview Preparation
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {interview.questions.slice(0, 3).map((q, idx) => (
                  <div key={idx} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#00a19b' }}>{q.skill} • {q.focus_area}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1410', marginTop: 2 }}>{q.question}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
