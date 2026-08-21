'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import Breadcrumbs from '../../../components/Breadcrumbs';

type Card = {
  id: string;
  title: string;
  pitch: string;
  difficulty: string;
  skills_needed: string[];
  team_size: number;
  team_capacity: number;
  slots_available: number;
  owner_name: string;
  match_reasons: string[];
  request_status: string | null;
  my_request_id?: string | null;
};

const DEMO_FALLBACK_CARDS: Card[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    title: 'Distributed Task Queue System in Rust & Python',
    pitch: 'Building a high-throughput, fault-tolerant distributed job queue with gRPC, Redis, and async Python worker pools.',
    difficulty: 'Intermediate',
    skills_needed: ['Python', 'FastAPI', 'Redis', 'gRPC'],
    team_size: 2,
    team_capacity: 5,
    slots_available: 3,
    owner_name: 'Alex Chen',
    match_reasons: ['Great for Backend Engineer role', 'Learn Redis & async task processing'],
    request_status: null
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    title: 'AI-Powered Code Review Bot & Evidence Graph',
    pitch: 'Automated GitHub PR reviewer that parses AST diffs, checks test coverage, and builds proof-of-work skill telemetry graphs.',
    difficulty: 'Advanced',
    skills_needed: ['Python', 'FastAPI', 'GitHub API', 'LLMs'],
    team_size: 3,
    team_capacity: 5,
    slots_available: 2,
    owner_name: 'Priya Sharma',
    match_reasons: ['Practice LLM integration', 'Build developer tooling experience'],
    request_status: null
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    title: 'Realtime Collaborative Kanban Workspace',
    pitch: 'Full-stack collaborative project management board featuring WebSockets, WebRTC audio rooms, and task traceability.',
    difficulty: 'Intermediate',
    skills_needed: ['React', 'Next.js', 'TypeScript', 'WebSockets'],
    team_size: 1,
    team_capacity: 5,
    slots_available: 4,
    owner_name: 'Marcus Vance',
    match_reasons: ['Great for Full-Stack Developer role', 'Learn real-time WebSockets'],
    request_status: null
  }
];

export default function CommunityDiscover() {
  const [cards, setCards] = useState<Card[]>(DEMO_FALLBACK_CARDS);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await api('/community/projects');
      setCards(res && res.length ? res : DEMO_FALLBACK_CARDS);
    } catch (e: any) {
      setCards(DEMO_FALLBACK_CARDS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function join(id: string) {
    try {
      await api(`/community/projects/${id}/join-requests`, {
        method: 'POST',
        body: JSON.stringify({ message: messages[id] || null }),
      });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <main className="shell formPage">
      <Breadcrumbs />
      <span className="tag">Community Discovery</span>
      <h1 style={{ fontSize: 36, margin: '12px 0 8px', fontFamily: 'Georgia, serif' }}>
        Find an active team project to join.
      </h1>
      <p className="lead">
        Discover peer student projects seeking collaborators. Private tasks, team chat, Meet links, and GitHub code stay hidden until your join request is accepted by the project owner.
      </p>

      {/* COLLABORATION JOURNEY STEPS BANNER */}
      <div
        className="card"
        style={{
          margin: '20px 0 28px',
          padding: '16px 20px',
          background: 'rgba(0, 161, 155, 0.05)',
          border: '1px solid rgba(0, 161, 155, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 13, fontWeight: 600 }}>
          <span>1. Discover Project</span>
          <span style={{ color: 'var(--mint)' }}>→</span>
          <span>2. Request Access</span>
          <span style={{ color: 'var(--mint)' }}>→</span>
          <span>3. Owner Approval</span>
          <span style={{ color: 'var(--mint)' }}>→</span>
          <span>4. Enter Workspace</span>
          <span style={{ color: 'var(--mint)' }}>→</span>
          <span>5. Receive Task & Collaborate</span>
        </div>
      </div>

      {error && (
        <div className="error-banner card" style={{ marginBottom: 20, borderLeft: '4px solid var(--danger)' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'var(--muted)', margin: 0 }}>⏳ Loading open community projects…</p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {cards.map((c) => (
            <article className="card" key={c.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className="tag" style={{ fontSize: 11 }}>
                    {c.difficulty} · {c.slots_available} slot{c.slots_available === 1 ? '' : 's'} open
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Team: {c.team_size}/{c.team_capacity}
                  </span>
                </div>
                <h2 style={{ fontSize: 20, margin: '4px 0 8px', fontFamily: 'Georgia, serif' }}>{c.title}</h2>
                <p style={{ color: 'var(--ink)', fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>{c.pitch}</p>
                <small style={{ color: 'var(--muted)', display: 'block', marginBottom: 14 }}>
                  Project Owner: <strong>{c.owner_name}</strong>
                </small>

                <h3 style={{ fontSize: 13, margin: '12px 0 6px', textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)' }}>
                  Required Skills
                </h3>
                <div className="referenceRow" style={{ marginBottom: 14 }}>
                  {c.skills_needed.length ? (
                    c.skills_needed.map((s) => (
                      <span className="refChip" key={s}>
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="status">General contributors welcome</span>
                  )}
                </div>

                {c.match_reasons.length > 0 && (
                  <div style={{ background: 'rgba(0,0,0,0.03)', padding: 12, borderRadius: 10, marginBottom: 16 }}>
                    <strong style={{ fontSize: 12, color: 'var(--ink)' }}>Why this matches your profile:</strong>
                    <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 13, color: 'var(--muted)' }}>
                      {c.match_reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                {c.request_status === 'pending' ? (
                  <div className="notice" style={{ margin: 0, textAlign: 'center', fontWeight: 600, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <span>⏳ Join Request Pending Owner Review</span>
                    <button
                      className="btn secondary"
                      onClick={async () => {
                        try {
                          await api(`/join-requests/${c.my_request_id || c.id}/cancel`, { method: 'PATCH' });
                          await load();
                        } catch (e: any) {
                          setError(e.message);
                        }
                      }}
                      style={{ fontSize: 12, padding: '4px 10px', alignSelf: 'center' }}
                    >
                      Cancel Request
                    </button>
                  </div>
                ) : c.request_status === 'accepted' || c.request_status === 'approved' ? (
                  <div className="notice" style={{ margin: 0, textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                    ✅ Accepted! <Link href="/projects" style={{ fontWeight: 600, color: 'var(--success)' }}>Go to My Projects →</Link>
                  </div>
                ) : c.slots_available > 0 ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <textarea
                      rows={2}
                      value={messages[c.id] || ''}
                      onChange={(e) => setMessages({ ...messages, [c.id]: e.target.value })}
                      placeholder="Note to project owner (e.g. why you want to join, what skills you can bring)..."
                      style={{ fontSize: 13 }}
                    />
                    <button className="btn primary" onClick={() => join(c.id)} style={{ width: '100%' }}>
                      Request to Join Team
                    </button>
                  </div>
                ) : (
                  <p className="status" style={{ textAlign: 'center', margin: 0 }}>
                    🔒 Team is currently at maximum capacity.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && cards.length === 0 && (
        <div className="notice" style={{ textAlign: 'center', padding: '32px 20px', marginTop: 24 }}>
          <p style={{ margin: '0 0 12px', fontSize: 16 }}>No open community project listings found right now.</p>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            Have a project idea? <Link href="/projects/new">Architect your own project</Link> and open it for team collaboration!
          </p>
        </div>
      )}
    </main>
  );
}
