'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { api } from '../../../lib/api';
import Breadcrumbs from '../../../components/Breadcrumbs';

type Task = {
  title: string;
  description: string;
  completion_criteria: string;
  required_skills: string[];
  resources: string[];
};

type Plan = {
  project_summary: string;
  suggested_stack: string[];
  completion_definition: string[];
  milestones: { title: string; objective: string; tasks: Task[] }[];
  generated_by: 'ai' | 'local-demo';
  notice: string;
};

function NewProjectForm() {
  const q = useSearchParams();
  const router = useRouter();
  const rec = q.get('recommendation') || '';

  const [title, setTitle] = useState(rec);
  const [description, setDescription] = useState(
    rec ? `Build ${rec} as a focused student project that solves the stated problem and produces reviewable technical evidence.` : ''
  );
  const [difficulty, setDifficulty] = useState('intermediate');
  const [stack, setStack] = useState('');
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function architect() {
    if (title.trim().length < 3) {
      setError('Please provide a project title with at least 3 characters.');
      return;
    }
    if (description.trim().length < 10) {
      setError('Please provide a project description with at least 10 characters explaining what you want to build.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api('/projects/architect', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          difficulty,
          desired_stack: stack.split(',').map((x) => x.trim()).filter(Boolean),
        }),
      });
      setPlan(res);
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'Could not generate project plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function accept() {
    if (!plan) return;
    setLoading(true);
    setError('');
    try {
      const p = await api('/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          difficulty,
          desired_stack: stack.split(',').map((x) => x.trim()).filter(Boolean),
          plan,
        }),
      });
      router.push(`/projects/${p.id}`);
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'Could not save project. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell formPage">
      <Breadcrumbs />
      <span className="tag">Project Architect</span>
      <h1 style={{ fontSize: 36, margin: '12px 0 8px', fontFamily: 'Georgia, serif' }}>
        Turn your idea into an executable project.
      </h1>
      <p className="lead">
        The architect proposes a bounded milestone and task plan. Nothing is persisted as an active project until you review and accept it.
      </p>

      {error && (
        <div className="error-banner card" style={{ marginTop: 16, borderLeft: '4px solid var(--danger)' }}>
          <p style={{ color: 'var(--danger)', margin: 0, fontWeight: 600 }}>⚠️ {error}</p>
        </div>
      )}

      {/* STEP 1: IDEA SPECIFICATION FORM */}
      <div className="formCard" style={{ maxWidth: 780 }}>
        <label>
          Project Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Real-Time Distributed Task Queue"
            required
            minLength={3}
          />
        </label>
        <label>
          Problem & Project Description
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What problem does this project solve? What technical capabilities will it demonstrate?"
            required
            minLength={10}
          />
        </label>
        <label>
          Difficulty Level
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="beginner">Beginner (1-2 milestones)</option>
            <option value="intermediate">Intermediate (3-4 milestones)</option>
            <option value="challenging">Challenging (4+ milestones)</option>
          </select>
        </label>
        <label>
          Preferred Tech Stack (Comma separated, optional)
          <input
            value={stack}
            onChange={(e) => setStack(e.target.value)}
            placeholder="FastAPI, Next.js, PostgreSQL, Docker"
          />
        </label>
        <button
          className="btn primary"
          disabled={loading || title.trim().length < 3 || description.trim().length < 10}
          onClick={architect}
          style={{ marginTop: 8 }}
        >
          {loading ? '⏳ Generating Plan…' : plan ? '🔄 Regenerate Project Plan' : '⚡ Generate Project Plan'}
        </button>
      </div>

      {/* STEP 2: INTERACTIVE PLAN REVIEW */}
      {plan && (
        <section className="planReview" style={{ maxWidth: 780, marginTop: 32 }}>
          <div className="resultHead">
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', margin: '0 0 6px' }}>Proposed Milestone & Task Plan</h2>
              <p>{plan.notice}</p>
            </div>
            <span className="tag">{plan.generated_by === 'ai' ? 'AI Architect' : 'Local Demo Architect'}</span>
          </div>

          <div className="planSummary" style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 16, margin: '0 0 8px' }}>Suggested Tech Stack</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {plan.suggested_stack.map((s) => (
                <span className="refChip" key={s}>
                  {s}
                </span>
              ))}
            </div>
            <h3 style={{ fontSize: 16, margin: '16px 0 8px' }}>Definition of Completion</h3>
            <ul>
              {plan.completion_definition.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>

          {plan.milestones.map((m, i) => (
            <article className="milestone" key={m.title}>
              <span className="tag">Milestone {i + 1}</span>
              <h2 style={{ fontSize: 22, margin: '8px 0 4px', fontFamily: 'Georgia, serif' }}>{m.title}</h2>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{m.objective}</p>
              {m.tasks.map((t, j) => (
                <div className="task" key={t.title}>
                  <strong>
                    Task {j + 1}: {t.title}
                  </strong>
                  <p style={{ fontSize: 14 }}>{t.description}</p>
                  <small>
                    <b>Done criteria:</b> {t.completion_criteria}
                  </small>
                  <small style={{ marginTop: 4 }}>
                    <b>Skills to practice:</b> {t.required_skills.join(' · ')}
                  </small>
                </div>
              ))}
            </article>
          ))}

          <div className="actions left" style={{ marginTop: 24, gap: 16 }}>
            <button className="btn primary" onClick={accept} disabled={loading} style={{ padding: '14px 28px', fontSize: 16 }}>
              {loading ? 'Saving Project…' : '✅ Accept & Create Project Workspace'}
            </button>
            <button className="btn secondary" onClick={() => setPlan(null)}>
              ✏️ Edit Idea Details
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default function NewProject() {
  return (
    <Suspense
      fallback={
        <main className="shell formPage">
          <p>Loading Architect Form…</p>
        </main>
      }
    >
      <NewProjectForm />
    </Suspense>
  );
}
