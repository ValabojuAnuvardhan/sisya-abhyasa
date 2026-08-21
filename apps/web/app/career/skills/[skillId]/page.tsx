'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getCareerSkillDetail, CareerSkillDetailResponse } from '../../../../lib/api';

export default function CareerSkillDetailPage() {
  const params = useParams();
  const rawSkillId = params?.skillId as string;
  const skillName = decodeURIComponent(rawSkillId || '');

  const [detail, setDetail] = useState<CareerSkillDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const loadSkillDetail = async () => {
    if (!skillName) return;
    setLoading(true);
    setError('');
    try {
      const res = await getCareerSkillDetail(skillName);
      setDetail(res);
    } catch (err: any) {
      setError(err.message || `Failed to load evidence graph for ${skillName}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkillDetail();
  }, [skillName]);

  return (
    <div style={{ backgroundColor: '#f7f2eb', minHeight: 'calc(100vh - 64px)', color: '#1a1410', padding: '32px 16px' }}>
      <main style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* BREADCRUMB */}
        <div>
          <Link href="/career" style={{ fontSize: 13, color: '#00a19b', fontWeight: 700, textDecoration: 'none' }}>
            ← Back to Career Readiness
          </Link>
        </div>

        {/* HEADER */}
        <header style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6f67', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Skill Evidence Graph
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '4px 0 0 0', fontFamily: 'Georgia, serif', color: '#1a1410' }}>
              {skillName}
            </h1>
          </div>

          {detail && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#00a19b', fontFamily: 'Georgia, serif' }}>
                  {detail.evidence_count} Verified PRs
                </div>
                <div style={{ fontSize: 12, color: '#7a6f67', fontWeight: 600 }}>
                  Freshness: <span style={{ color: detail.freshness === 'RECENT' ? '#059669' : '#dc2626' }}>{detail.freshness}</span>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* ERROR STATE */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: 16, borderRadius: 12, fontSize: 14 }}>
            ⚠️ {error}
            <button onClick={loadSkillDetail} style={{ marginLeft: 12, fontSize: 12, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: '#991b1b' }}>
              [Try Again]
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div style={{ height: 200, background: 'rgba(0,0,0,0.04)', borderRadius: 20 }} />
        )}

        {!loading && detail && (
          <>
            {/* EVIDENCE EXPLANATION */}
            <section style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: '#1a1410' }}>
                Evidence Integrity & Attribution
              </h2>
              <p style={{ fontSize: 14, color: '#7a6f67', margin: 0, lineHeight: 1.6 }}>
                {detail.evidence_explanation}
              </p>
            </section>

            {/* VERIFIED PRS LIST */}
            <section style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, fontFamily: 'Georgia, serif', color: '#1a1410' }}>
                🔀 Verified Pull Requests ({detail.verified_prs.length})
              </h2>

              {detail.verified_prs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {detail.verified_prs.map((pr) => (
                    <div key={pr.pr_id} style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.06)', padding: 16, borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#00a19b' }}>
                          PR #{pr.number} — {pr.title}
                        </div>
                        <div style={{ fontSize: 12, color: '#7a6f67', marginTop: 4 }}>
                          State: <span style={{ fontWeight: 600, color: pr.merged ? '#059669' : '#d97706' }}>{pr.merged ? 'Merged' : pr.state}</span>
                        </div>
                      </div>
                      {pr.html_url && (
                        <a href={pr.html_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>
                          View GitHub PR ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: 14 }}>
                  <p style={{ fontSize: 14, color: '#7a6f67', margin: 0, fontStyle: 'italic' }}>
                    No verified GitHub PRs recorded yet for {skillName}.
                  </p>
                </div>
              )}
            </section>

            {/* LINKED PROJECTS */}
            <section style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, fontFamily: 'Georgia, serif', color: '#1a1410' }}>
                📁 Linked Projects ({detail.linked_projects.length})
              </h2>

              {detail.linked_projects.length > 0 ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  {detail.linked_projects.map((proj) => (
                    <div key={proj.id} style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.06)', padding: 16, borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1410' }}>{proj.title}</div>
                        {proj.description && <div style={{ fontSize: 13, color: '#7a6f67', marginTop: 4 }}>{proj.description}</div>}
                      </div>
                      <Link href={`/projects/${proj.id}`} style={{ fontSize: 12, fontWeight: 700, color: '#00a19b', textDecoration: 'none' }}>
                        Open Workspace →
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: 14 }}>
                  <p style={{ fontSize: 14, color: '#7a6f67', margin: 0, fontStyle: 'italic' }}>
                    No linked projects demonstrating {skillName} yet.
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
