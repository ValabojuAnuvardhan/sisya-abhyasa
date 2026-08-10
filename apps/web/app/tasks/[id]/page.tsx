'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { TaskTraceabilityCard } from '../../../components/github/TaskTraceabilityCard';
import { EvidenceGraphCard } from '../../../components/github/EvidenceGraphCard';

type Task = {
  id: string;
  project_id: string;
  project_title: string;
  milestone_title: string;
  title: string;
  description: string;
  completion_criteria: string;
  required_skills: string[];
  resources: string[];
  status: string;
};

export default function TaskPage() {
  const { id } = useParams<{ id: string }>();
  const [t, setT] = useState<Task | null>(null);
  const [q, setQ] = useState('');
  const [answer, setAnswer] = useState('');
  const [notice, setNotice] = useState('');
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api(`/tasks/${id}`)
      .then((res) => setT(res))
      .catch((e) => setError(e.message || 'Failed to load task details'))
      .finally(() => setLoading(false));
  }, [id]);

  async function ask() {
    if (!q.trim()) return;
    setAsking(true);
    try {
      const r = await api(`/tasks/${id}/mentor`, {
        method: 'POST',
        body: JSON.stringify({ question: q }),
      });
      setAnswer(r.answer);
      setNotice(r.notice);
    } catch (e: any) {
      setError(e.message || 'Could not reach mentor helper');
    } finally {
      setAsking(false);
    }
  }

  if (loading) {
    return (
      <main className="shell formPage">
        <Breadcrumbs />
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'var(--muted)', margin: 0 }}>⏳ Loading task details…</p>
        </div>
      </main>
    );
  }

  if (error || !t) {
    return (
      <main className="shell formPage">
        <Breadcrumbs />
        <div className="error-banner card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>⚠️ {error || 'Task not found'}</p>
        </div>
        <div style={{ marginTop: 16 }}>
          <Link href="/projects" className="btn secondary">
            ← Back to Projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="shell formPage">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: t.project_title, href: `/projects/${t.project_id}` },
        ]}
        current={t.title}
      />

      <span className="tag">
        {t.project_title} · {t.milestone_title}
      </span>
      <h1 style={{ fontSize: 32, margin: '10px 0 6px', fontFamily: 'Georgia, serif' }}>{t.title}</h1>
      <p className="lead" style={{ marginBottom: 24 }}>
        {t.description}
      </p>

      {/* 2-COLUMN TASK WORKSPACE GRID */}
      <div className="teamSpaceGrid">
        {/* LEFT COLUMN: TASK SPEC & LEARNING RESOURCES & TRACEABILITY */}
        <div style={{ display: 'grid', gap: 20 }}>
          <section className="card">
            <h2 style={{ fontSize: 18, margin: '0 0 12px', fontFamily: 'Georgia, serif' }}>🎯 Completion Criteria (Done When)</h2>
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.06)',
                borderLeft: '4px solid var(--success)',
              }}
            >
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--ink)' }}>{t.completion_criteria}</p>
            </div>
          </section>

          {/* SPRINT 5: TASK ↔ PR TRACEABILITY ENGINE CARD */}
          <TaskTraceabilityCard taskId={t.id} />

          {/* SPRINT 6: EVIDENCE GRAPH & BUNDLE STORE CARD */}
          <EvidenceGraphCard taskId={t.id} projectId={t.project_id} />

          <section className="card">
            <h2 style={{ fontSize: 18, margin: '0 0 12px', fontFamily: 'Georgia, serif' }}>🛠️ Required Skills & Frameworks</h2>
            <div className="chips">
              {t.required_skills.map((s) => (
                <span className="tag" key={s} style={{ fontSize: 12 }}>
                  {s}
                </span>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 style={{ fontSize: 18, margin: '0 0 12px', fontFamily: 'Georgia, serif' }}>📚 Learning Resources</h2>
            {t.resources.length ? (
              <ul style={{ paddingLeft: 20, margin: 0, color: 'var(--ink)', fontSize: 14, lineHeight: 1.6 }}>
                {t.resources.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>
                No external resources attached. Ask the AI Mentor on the right for guidance or code examples!
              </p>
            )}
          </section>

          <div>
            <Link href={`/projects/${t.project_id}`} className="btn secondary">
              ← Return to Project Workspace
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: AI CONTEXTUAL MENTOR PANEL */}
        <div style={{ alignSelf: 'start' }}>
          <section className="card" style={{ background: 'rgba(0, 161, 155, 0.03)', border: '1px solid rgba(0, 161, 155, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>🧠</span>
              <h2 style={{ fontSize: 18, margin: 0, fontFamily: 'Georgia, serif' }}>Task AI Mentor</h2>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Ask technical questions grounded specifically in this task’s completion criteria and tech stack.
            </p>

            <div style={{ display: 'grid', gap: 10 }}>
              <textarea
                rows={4}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What technical concept or implementation step are you stuck on?"
                style={{ fontSize: 13 }}
              />
              <button className="btn primary" disabled={asking || !q.trim()} onClick={ask} style={{ width: '100%' }}>
                {asking ? 'Asking Mentor…' : 'Ask Mentor'}
              </button>
            </div>

            {answer && (
              <div
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 12,
                  background: 'var(--bg-app)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <strong style={{ fontSize: 13, color: 'var(--mint)', display: 'block', marginBottom: 6 }}>
                  💡 Mentor Guidance
                </strong>
                <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, margin: '0 0 8px', whiteSpace: 'pre-wrap' }}>
                  {answer}
                </p>
                {notice && <small style={{ color: 'var(--muted)', fontSize: 11, display: 'block' }}>{notice}</small>}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
