'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import Breadcrumbs from '../../components/Breadcrumbs';

type SkillEvidence = {
  name: string;
  evidence_kind: string;
  explanation: string;
};

type Contribution = {
  pull_request_number: number;
  title: string;
  status: string;
  task: string | null;
  skills: SkillEvidence[];
};

type ProjectEvidence = {
  project_id: string;
  title: string;
  description: string;
  difficulty: string;
  repository_visibility: string;
  contributions: Contribution[];
};

type ProofData = {
  student: {
    name: string;
    target_role: string | null;
    experience_level: string | null;
  };
  projects: ProjectEvidence[];
  notice: string;
  publishing: {
    public: boolean;
    slug: string | null;
  };
};

export default function Proof() {
  const [d, setD] = useState<ProofData | null>(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api('/proof-of-work/me');
      setD(res);
    } catch (e: any) {
      setErr(e.message || 'Could not load Proof-of-Work data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function toggle() {
    setBusy(true);
    try {
      await api(d?.publishing.public ? '/proof-of-work/unpublish' : '/proof-of-work/publish', { method: 'POST' });
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="shell formPage">
        <Breadcrumbs />
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'var(--muted)', margin: 0 }}>⏳ Loading Proof-of-Work portfolio…</p>
        </div>
      </main>
    );
  }

  if (err || !d) {
    return (
      <main className="shell formPage">
        <Breadcrumbs />
        <div className="error-banner card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>⚠️ {err || 'Failed to load portfolio'}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="shell formPage">
      <Breadcrumbs />
      <span className="tag">Proof-of-Work Portfolio</span>
      <h1 style={{ fontSize: 36, margin: '12px 0 8px', fontFamily: 'Georgia, serif' }}>
        {d.student.name}'s Verified Evidence
      </h1>
      <p className="lead">
        {d.student.target_role || 'Software Engineering Student'} · {d.student.experience_level || 'Intermediate Level'}
      </p>

      {/* PRIVACY ASSURANCE BANNER */}
      <div
        className="card"
        style={{
          margin: '20px 0',
          padding: '18px 22px',
          background: 'rgba(0, 161, 155, 0.04)',
          border: '1px solid rgba(0, 161, 155, 0.2)',
        }}
      >
        <strong style={{ fontSize: 15, display: 'block', marginBottom: 4, color: 'var(--ink)' }}>
          🔒 Recruiter-Ready & Privacy-Safe
        </strong>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
          Your public portfolio displays demonstrated skill claims verified by merged pull requests. Private repository code, internal commits, and environment variables are strictly protected and never leaked.
        </p>
      </div>

      {/* PUBLISHING CONTROLS */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, fontFamily: 'Georgia, serif' }}>Public Link Visibility</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
            {d.publishing.public ? '🟢 Your portfolio is live and accessible via public link.' : '🔒 Your portfolio is currently private.'}
          </p>
        </div>
        <div className="actions left" style={{ margin: 0 }}>
          <button className="btn primary" disabled={busy} onClick={toggle}>
            {busy ? 'Updating…' : d.publishing.public ? 'Unpublish Portfolio' : 'Publish Portfolio'}
          </button>
          {d.publishing.public && d.publishing.slug && (
            <a className="btn secondary" href={`/p/${d.publishing.slug}`} target="_blank" rel="noreferrer">
              🔗 Open Public Profile
            </a>
          )}
        </div>
      </div>

      {/* EVIDENCE PROJECTS LIST */}
      <section className="planReview">
        <h2 style={{ fontSize: 24, margin: '0 0 16px', fontFamily: 'Georgia, serif' }}>Evidence-Backed Projects</h2>

        {d.projects.length === 0 ? (
          <div className="notice" style={{ padding: '24px 20px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600 }}>No publishable evidence recorded yet.</p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
              To generate verified evidence, connect your active project workspace to GitHub, open a pull request, and merge it!
            </p>
          </div>
        ) : (
          d.projects.map((p) => (
            <article className="card" key={p.project_id} style={{ marginBottom: 20 }}>
              <span className="tag" style={{ fontSize: 11 }}>
                {p.difficulty} · {p.repository_visibility}
              </span>
              <h3 style={{ fontSize: 20, margin: '8px 0 6px', fontFamily: 'Georgia, serif' }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>{p.description}</p>

              {p.contributions.map((c) => (
                <div
                  className="task"
                  key={c.pull_request_number}
                  style={{
                    background: 'rgba(0,0,0,0.02)',
                    padding: 14,
                    borderRadius: 12,
                    borderLeft: '4px solid var(--mint)',
                    marginTop: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>PR #{c.pull_request_number}: {c.title}</strong>
                    <span className="refChip">Merged Contribution</span>
                  </div>
                  {c.task && (
                    <small style={{ color: 'var(--muted)', display: 'block', marginTop: 4 }}>
                      Task context: <strong>{c.task}</strong>
                    </small>
                  )}

                  {c.skills.map((s) => (
                    <div key={s.name} style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <span className="tag" style={{ fontSize: 11, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                        ✓ {s.name} · Demonstrated
                      </span>
                      <p style={{ fontSize: 13, color: 'var(--ink)', margin: '4px 0 0', lineHeight: 1.5 }}>{s.explanation}</p>
                    </div>
                  ))}
                </div>
              ))}
            </article>
          ))
        )}
      </section>

      <p className="note" style={{ marginTop: 32 }}>
        {d.notice}
      </p>
    </main>
  );
}
