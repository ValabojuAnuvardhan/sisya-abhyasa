'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getOpportunityDetail, createApplication, CareerOpportunityDTO, OpportunityMatchResponse } from '../../../../lib/api';

export default function OpportunityDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [opp, setOpp] = useState<CareerOpportunityDTO | null>(null);
  const [match, setMatch] = useState<OpportunityMatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const loadDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await getOpportunityDetail(id);
      setOpp(res);
      if (res.match) setMatch(res.match);
    } catch (err: any) {
      setError(err.message || 'Failed to load opportunity details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleSaveApplication = async () => {
    if (!id) return;
    setSaving(true);
    setError('');
    try {
      await createApplication(id, 'SAVED');
      setNotice('✅ Opportunity saved to Application Tracker!');
    } catch (err: any) {
      setError(err.message || 'Failed to save application');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f7f2eb', minHeight: 'calc(100vh - 64px)', color: '#1a1410', padding: '32px 16px' }}>
      <main style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* BREADCRUMB */}
        <div>
          <Link href="/career/opportunities" style={{ fontSize: 13, color: '#00a19b', fontWeight: 700, textDecoration: 'none' }}>
            ← Back to Opportunities
          </Link>
        </div>

        {/* ERROR & NOTICE */}
        {notice && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', borderLeft: '4px solid #10b981', color: '#047857', padding: 16, borderRadius: 12, fontSize: 14 }}>
            {notice}
          </div>
        )}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: 16, borderRadius: 12, fontSize: 14 }}>
            ⚠️ {error}
            <button onClick={loadDetail} style={{ marginLeft: 12, fontSize: 12, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: '#991b1b' }}>
              [Try Again]
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div style={{ height: 240, background: 'rgba(0,0,0,0.04)', borderRadius: 20 }} />
        )}

        {!loading && opp && match && (
          <>
            {/* HEADER */}
            <header style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#7a6f67', textTransform: 'uppercase' }}>{opp.company_name}</span>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: '4px 0 0 0', fontFamily: 'Georgia, serif', color: '#1a1410' }}>
                  {opp.title}
                </h1>
                <div style={{ fontSize: 13, color: '#7a6f67', marginTop: 4 }}>
                  {opp.location} • {opp.employment_type} • {opp.experience_level}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#00a19b', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                    {match.match_score}%
                  </div>
                  <div style={{ fontSize: 12, color: '#7a6f67', fontWeight: 600, marginTop: 2 }}>Match Score</div>
                </div>

                <button onClick={handleSaveApplication} disabled={saving} style={{ background: '#00a19b', color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  {saving ? 'Saving...' : 'Save Application'}
                </button>
              </div>
            </header>

            {/* MATCH SCORE RADAR BREAKDOWN */}
            <section style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, fontFamily: 'Georgia, serif', color: '#1a1410' }}>
                📊 Match Breakdown
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Role Alignment', value: match.role_match },
                  { label: 'Skill Coverage', value: match.skill_match },
                  { label: 'Evidence Strength', value: match.evidence_match },
                  { label: 'Experience Match', value: match.experience_match },
                ].map((item) => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.06)', padding: 16, borderRadius: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6f67', textTransform: 'uppercase' }}>{item.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1410', marginTop: 4, fontFamily: 'Georgia, serif' }}>{item.value}%</div>
                    <div style={{ background: 'rgba(0,0,0,0.08)', height: 5, borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${item.value}%`, height: '100%', background: '#00a19b', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* MISSING REQUIREMENTS & RECOMMENDATIONS */}
            {match.missing_required_skills.length > 0 && (
              <section style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
                  ⚠️ Missing Requirements ({match.missing_required_skills.length})
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1410' }}>
                  Required skills lacking verified PR evidence: {match.missing_required_skills.join(', ')}
                </div>
                {match.recommended_actions.map((act, i) => (
                  <p key={i} style={{ fontSize: 13, color: '#7a6f67', margin: 0 }}>
                    💡 {act}
                  </p>
                ))}
                <div style={{ marginTop: 4 }}>
                  <Link href="/projects" style={{ background: '#00a19b', color: '#fff', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                    Open Task Board to Prove Skills →
                  </Link>
                </div>
              </section>
            )}

            {/* DESCRIPTION */}
            <section style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, fontFamily: 'Georgia, serif', color: '#1a1410' }}>
                Job Description
              </h2>
              <p style={{ fontSize: 14, color: '#7a6f67', lineHeight: 1.6, margin: 0 }}>
                {opp.description}
              </p>
              {opp.application_url && (
                <div style={{ marginTop: 16 }}>
                  <a href={opp.application_url} target="_blank" rel="noopener noreferrer" style={{ background: '#1a1410', color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                    Apply on Company Website ↗
                  </a>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
