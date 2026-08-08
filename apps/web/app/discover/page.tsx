'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import Breadcrumbs from '../../components/Breadcrumbs';

type Rec = {
  id: string;
  title: string;
  problem: string;
  why_this_matches: string;
  difficulty: string;
  suggested_stack: string[];
  skills_to_practice: string[];
  skills_to_learn: string[];
  expected_deliverables: string[];
  evidence_opportunities: string[];
};

type Result = {
  recommendations: Rec[];
  generated_by: 'ai' | 'local-demo';
  notice: string;
};

export default function Discover() {
  const { user } = useAuth();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [interests, setInterests] = useState('');
  const [desired, setDesired] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [time, setTime] = useState('moderate');

  useEffect(() => {
    if (user?.interests) setInterests(user.interests);
  }, [user]);

  async function generate() {
    setLoading(true);
    setError('');
    try {
      setResult(
        await api('/project-ideas/recommend', {
          method: 'POST',
          body: JSON.stringify({
            interests,
            desired_skills: desired.split(',').map((x) => x.trim()).filter(Boolean),
            preferred_difficulty: difficulty || null,
            time_commitment: time,
          }),
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate project recommendations');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell formPage">
      <Breadcrumbs />
      <span className="tag">Project Discovery</span>
      <h1 style={{ fontSize: 36, margin: '12px 0 8px', fontFamily: 'Georgia, serif' }}>
        Find a realistic project worth building.
      </h1>
      <p className="lead">
        We use your target role and skills to recommend a bounded set of real-world projects. Focus on building technical evidence, not an endless tutorial feed.
      </p>

      {user && !user.onboarding_completed && (
        <div className="notice" style={{ marginBottom: 20 }}>
          💡 Complete your profile onboarding first to get better recommendations.{' '}
          <Link href="/onboarding" style={{ fontWeight: 600 }}>
            Go to onboarding →
          </Link>
        </div>
      )}

      <div className="formCard" style={{ maxWidth: 780 }}>
        {user && (
          <div className="profileSummary" style={{ marginBottom: 12 }}>
            <strong>Target Role: {user.target_role || 'Not set'}</strong>
            <span>
              {user.experience_level || 'Beginner'} · {user.skills.map((s) => s.name).join(', ') || 'No skills set'}
            </span>
          </div>
        )}
        <label>
          Interests & Domains
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="AI, web apps, developer tools, fintech…"
          />
        </label>
        <label>
          Skills You Want to Learn (Comma separated)
          <input
            value={desired}
            onChange={(e) => setDesired(e.target.value)}
            placeholder="FastAPI, React, PostgreSQL, Docker"
          />
        </label>
        <label>
          Preferred Difficulty Level
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">Recommend based on my profile</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="challenging">Challenging</option>
          </select>
        </label>
        <label>
          Time Commitment
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            <option value="light">Light (1-2 weeks)</option>
            <option value="moderate">Moderate (2-4 weeks)</option>
            <option value="intensive">Intensive (4+ weeks)</option>
          </select>
        </label>
        <button className="btn primary" onClick={generate} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? '⏳ Analyzing & Recommending…' : result ? '🔄 Recommend Another Set' : '⚡ Find Projects for Me'}
        </button>
      </div>

      {error && (
        <div className="error-banner card" style={{ marginTop: 20, borderLeft: '4px solid var(--danger)' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      {result && (
        <section className="results" style={{ marginTop: 32 }}>
          <div className="resultHead">
            <div>
              <h2 style={{ fontFamily: 'Georgia, serif', margin: '0 0 6px' }}>Your Recommended Projects</h2>
              <p>{result.notice}</p>
            </div>
            <span className="tag">{result.generated_by === 'ai' ? 'AI Engine' : 'Local Demo Engine'}</span>
          </div>
          <div className="recommendations" style={{ marginTop: 20 }}>
            {result.recommendations.map((r) => (
              <article className="recommendation" key={r.id}>
                <div className="recTop" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="tag">{r.difficulty}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Role Aligned</span>
                </div>
                <h2 style={{ fontSize: 22, margin: '10px 0 8px', fontFamily: 'Georgia, serif' }}>{r.title}</h2>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--ink)' }}>{r.problem}</p>
                <p className="match" style={{ fontSize: 13 }}>
                  <strong>Why this matches:</strong> {r.why_this_matches}
                </p>

                <div className="recGrid" style={{ marginTop: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 12, margin: '0 0 4px', textTransform: 'uppercase' }}>Stack</h3>
                    <p style={{ fontSize: 13 }}>{r.suggested_stack.join(' · ')}</p>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 12, margin: '0 0 4px', textTransform: 'uppercase' }}>Practice</h3>
                    <p style={{ fontSize: 13 }}>{r.skills_to_practice.join(' · ')}</p>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 12, margin: '0 0 4px', textTransform: 'uppercase' }}>Learn</h3>
                    <p style={{ fontSize: 13 }}>{r.skills_to_learn.join(' · ')}</p>
                  </div>
                </div>

                <h3 style={{ fontSize: 14, margin: '16px 0 6px' }}>Expected Deliverables</h3>
                <ul style={{ paddingLeft: 18, fontSize: 13, margin: 0 }}>
                  {r.expected_deliverables.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>

                <h3 style={{ fontSize: 14, margin: '16px 0 6px' }}>Evidence Opportunities</h3>
                <ul style={{ paddingLeft: 18, fontSize: 13, margin: 0 }}>
                  {r.evidence_opportunities.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>

                <div className="actions left" style={{ marginTop: 20 }}>
                  <Link
                    className="btn primary"
                    href={`/projects/new?recommendation=${encodeURIComponent(r.title)}`}
                  >
                    Architect This Project →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <p className="note" style={{ marginTop: 32 }}>
        Recommendations provide structured project templates to help you generate verifiable evidence.
      </p>
    </main>
  );
}
