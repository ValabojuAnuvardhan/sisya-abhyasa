'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getCareerReadiness,
  getCareerSkills,
  getCareerGaps,
  getCareerEvidenceTimeline,
  getCareerRecommendations,
  CareerReadinessResponse,
  CareerSkillItem,
  SkillGapItem,
  EvidenceTimelineItem,
  CareerRecommendationResponse,
} from '../../lib/api';

export default function CareerReadinessPage() {
  const [readiness, setReadiness] = useState<CareerReadinessResponse | null>(null);
  const [skills, setSkills] = useState<CareerSkillItem[]>([]);
  const [gaps, setGaps] = useState<SkillGapItem[]>([]);
  const [timeline, setTimeline] = useState<EvidenceTimelineItem[]>([]);
  const [recommendation, setRecommendation] = useState<CareerRecommendationResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const loadCareerData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rRes, sRes, gRes, tRes, recRes] = await Promise.all([
        getCareerReadiness().catch(() => null),
        getCareerSkills().catch(() => null),
        getCareerGaps().catch(() => null),
        getCareerEvidenceTimeline().catch(() => null),
        getCareerRecommendations().catch(() => null),
      ]);

      if (rRes) setReadiness(rRes);
      if (sRes?.skills) setSkills(sRes.skills);
      if (gRes?.gaps) setGaps(gRes.gaps);
      if (tRes?.timeline) setTimeline(tRes.timeline);
      if (recRes) setRecommendation(recRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load career readiness graph');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCareerData();
  }, []);

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'JOB_READY': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#059669' };
      case 'PROVING': return { bg: 'rgba(0, 161, 155, 0.15)', color: '#00a19b' };
      case 'BUILDING': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#d97706' };
      case 'DEVELOPING': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' };
      default: return { bg: 'rgba(0, 0, 0, 0.08)', color: '#7a6f67' };
    }
  };

  const getFreshnessBadge = (freshness: string) => {
    switch (freshness) {
      case 'RECENT': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#059669', label: '🟢 Recent (<14d)' };
      case 'AGING': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#d97706', label: '🟡 Aging (14–60d)' };
      case 'HISTORICAL': return { bg: 'rgba(107, 114, 128, 0.15)', color: '#4b5563', label: '⚪ Historical (>60d)' };
      default: return { bg: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', label: '🔴 Missing (0 Evidence)' };
    }
  };

  return (
    <div style={{ backgroundColor: '#f7f2eb', minHeight: 'calc(100vh - 64px)', color: '#1a1410', padding: '32px 16px' }}>
      <main style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* TOP TAB NAV */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 12 }}>
          <Link href="/career" style={{ fontSize: 14, fontWeight: 700, color: '#00a19b', borderBottom: '2px solid #00a19b', paddingBottom: 10, textDecoration: 'none' }}>Overview</Link>
          <Link href="/career/opportunities" style={{ fontSize: 14, fontWeight: 600, color: '#7a6f67', textDecoration: 'none' }}>Opportunities</Link>
          <Link href="/career/action-plan" style={{ fontSize: 14, fontWeight: 600, color: '#7a6f67', textDecoration: 'none' }}>Action Plan</Link>
          <Link href="/career/applications" style={{ fontSize: 14, fontWeight: 600, color: '#7a6f67', textDecoration: 'none' }}>Applications</Link>
        </div>

        {/* HEADER */}
        <header style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6f67', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Career Intelligence Engine
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '4px 0 0 0', fontFamily: 'Georgia, serif', color: '#1a1410' }}>
              Career Readiness & Skill Graph
            </h1>
            <p style={{ fontSize: 14, color: '#7a6f67', margin: '4px 0 0 0' }}>
              Target Role: <strong style={{ color: '#00a19b' }}>{readiness?.target_role || 'Backend Developer'}</strong>
            </p>
          </div>

          {loading ? (
            <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.06)', borderRadius: 12, fontSize: 13 }}>Loading metrics...</div>
          ) : readiness ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#00a19b', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
                  {readiness.readiness_score}%
                </div>
                <div style={{ fontSize: 12, color: '#7a6f67', fontWeight: 600, marginTop: 2 }}>
                  Demonstrated Readiness
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, padding: '8px 16px', borderRadius: 20, ...getLevelBadgeColor(readiness.readiness_level) }}>
                {readiness.readiness_level.replace('_', ' ')}
              </span>
            </div>
          ) : null}
        </header>

        {/* ERROR STATE */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: 16, borderRadius: 12, fontSize: 14 }}>
            ⚠️ {error}
            <button onClick={loadCareerData} style={{ marginLeft: 12, fontSize: 12, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: '#991b1b' }}>
              [Try Again]
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ height: 160, background: 'rgba(0,0,0,0.04)', borderRadius: 20 }} />
            <div style={{ height: 240, background: 'rgba(0,0,0,0.04)', borderRadius: 20 }} />
          </div>
        )}

        {!loading && readiness && (
          <>
            {/* SECTION 1: READINESS BREAKDOWN SCORECARD */}
            <section style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: 'Georgia, serif', color: '#1a1410' }}>
                📊 Readiness Breakdown
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                
                {[
                  { label: 'Skill Coverage', value: readiness.breakdown.skill_coverage },
                  { label: 'Evidence Strength', value: readiness.breakdown.evidence_strength },
                  { label: 'Project Experience', value: readiness.breakdown.project_experience },
                  { label: 'Recent Activity', value: readiness.breakdown.recent_activity },
                  { label: 'Role Alignment', value: readiness.breakdown.role_alignment },
                ].map((item) => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.06)', padding: 16, borderRadius: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#7a6f67', textTransform: 'uppercase' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1410', marginTop: 4, fontFamily: 'Georgia, serif' }}>
                      {item.value}%
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.08)', height: 5, borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                      <div style={{ width: `${item.value}%`, height: '100%', background: '#00a19b', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}

              </div>
            </section>

            {/* SECTION 2: AI CAREER RECOMMENDATION & E8 LINK */}
            {recommendation && (
              <section style={{ background: 'rgba(0, 161, 155, 0.08)', border: '1px solid rgba(0, 161, 155, 0.3)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#00a19b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  🎯 AI Career Recommendation → E8 Next Best Action
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1410' }}>
                  {recommendation.recommended_action}
                </div>
                <p style={{ fontSize: 13, color: '#7a6f67', margin: 0 }}>
                  {recommendation.reason}
                </p>
                {recommendation.project_id && (
                  <div style={{ marginTop: 4 }}>
                    <Link href={`/projects/${recommendation.project_id}`} style={{ background: '#00a19b', color: '#fff', padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                      Open Project Workspace →
                    </Link>
                  </div>
                )}
              </section>
            )}

            {/* SECTION 3: SKILL MATRIX TABLE */}
            <section style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: 'Georgia, serif', color: '#1a1410' }}>
                  🎯 Skill Matrix ({skills.length} Required Skills)
                </h2>
                <span style={{ fontSize: 12, color: '#7a6f67', fontWeight: 600 }}>
                  {readiness.skills_proven} / {readiness.total_skills} Skills Proven
                </span>
              </div>

              {skills.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', color: '#7a6f67', fontSize: 12, textTransform: 'uppercase' }}>
                        <th style={{ padding: '10px 12px' }}>Skill</th>
                        <th style={{ padding: '10px 12px' }}>State</th>
                        <th style={{ padding: '10px 12px' }}>Evidence Count</th>
                        <th style={{ padding: '10px 12px' }}>Freshness</th>
                        <th style={{ padding: '10px 12px' }}>Proficiency</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.map((s) => {
                        const fresh = getFreshnessBadge(s.freshness);
                        return (
                          <tr key={s.skill_name} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                            <td style={{ padding: '12px', fontWeight: 700, color: '#1a1410' }}>
                              {s.skill_name}
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12, background: s.state === 'STRONG' ? 'rgba(16, 185, 129, 0.15)' : s.state === 'DEVELOPING' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: s.state === 'STRONG' ? '#059669' : s.state === 'DEVELOPING' ? '#2563eb' : '#dc2626' }}>
                                {s.state.replace('_', ' ')}
                              </span>
                            </td>
                            <td style={{ padding: '12px', fontWeight: 700, color: '#00a19b' }}>
                              {s.evidence_count} Verified PRs
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: fresh.color }}>
                                {fresh.label}
                              </span>
                            </td>
                            <td style={{ padding: '12px', color: '#7a6f67', fontSize: 13 }}>
                              {s.proficiency}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <Link href={`/career/skills/${encodeURIComponent(s.skill_name)}`} style={{ fontSize: 12, fontWeight: 700, color: '#00a19b', textDecoration: 'none' }}>
                                View Evidence Graph →
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: 14 }}>
                  <p style={{ fontSize: 14, color: '#7a6f67', margin: 0 }}>No skills recorded for this role yet.</p>
                </div>
              )}
            </section>

            {/* SECTION 4: CRITICAL SKILL GAPS PANEL */}
            {gaps.length > 0 && (
              <section style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: 'Georgia, serif', color: '#1a1410' }}>
                  ⚠️ Critical Skill Gaps ({gaps.length})
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {gaps.map((g) => (
                    <div key={g.skill_name} style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(220,38,38,0.2)', padding: 18, borderRadius: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1410' }}>{g.skill_name}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626', padding: '2px 8px', borderRadius: 12 }}>
                            {g.state.replace('_', ' ')}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: '#7a6f67', marginTop: 6, marginBottom: 0 }}>
                          {g.evidence_count === 0 ? 'No verified engineering evidence recorded yet.' : `Only ${g.evidence_count} verified PR(s) found.`}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <Link href="/projects" style={{ fontSize: 12, fontWeight: 700, background: '#00a19b', color: '#fff', padding: '6px 12px', borderRadius: 8, textDecoration: 'none' }}>
                          Find Project Task →
                        </Link>
                        <Link href="/learn" style={{ fontSize: 12, fontWeight: 700, background: 'rgba(0,0,0,0.06)', color: '#1a1410', padding: '6px 12px', borderRadius: 8, textDecoration: 'none' }}>
                          Learn →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SECTION 5: EVIDENCE TIMELINE STREAM */}
            <section style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, fontFamily: 'Georgia, serif', color: '#1a1410' }}>
                📜 Verified Evidence Timeline ({timeline.length} Events)
              </h2>

              {timeline.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {timeline.map((ev) => (
                    <div key={ev.id} style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.06)', padding: 16, borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#00a19b' }}>
                            ✓ Merged PR #{ev.pr_number || '—'}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(0, 161, 155, 0.12)', color: '#00a19b', padding: '2px 8px', borderRadius: 12 }}>
                            {ev.skill_name}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#1a1410', fontWeight: 600, marginTop: 4 }}>
                          {ev.pr_title || ev.explanation}
                        </div>
                        {ev.project_title && (
                          <div style={{ fontSize: 12, color: '#7a6f67', marginTop: 2 }}>
                            Project: <strong>{ev.project_title}</strong> {ev.task_title ? `• Task: ${ev.task_title}` : ''}
                          </div>
                        )}
                      </div>
                      {ev.pr_url && (
                        <a href={ev.pr_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                          View PR on GitHub ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: 14 }}>
                  <p style={{ fontSize: 14, color: '#7a6f67', margin: 0, fontStyle: 'italic' }}>
                    No verified engineering evidence recorded yet. Connect GitHub and merge your first PR to populate your timeline.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
