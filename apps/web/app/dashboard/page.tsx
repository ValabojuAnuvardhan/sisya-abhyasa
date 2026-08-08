'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import Breadcrumbs from '../../components/Breadcrumbs';

type Project = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  status: string;
  role: string;
};

type Task = {
  id: string;
  project_id: string;
  project_title: string;
  milestone_title: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'in_review' | 'done';
};

type ProofSummary = {
  publishing: { public: boolean; slug: string | null };
  projects: any[];
  notice: string;
};

type MentorObs = {
  id: string;
  title: string;
  summary: string;
  category: string;
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [proof, setProof] = useState<ProofSummary | null>(null);
  const [observations, setObservations] = useState<MentorObs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);
        const [projRes, proofRes, obsRes] = await Promise.allSettled([
          api('/projects'),
          api('/proof-of-work/me'),
          api('/mentor/observations'),
        ]);

        if (projRes.status === 'fulfilled') setProjects(projRes.value || []);
        if (proofRes.status === 'fulfilled') setProof(proofRes.value);
        if (obsRes.status === 'fulfilled') setObservations(obsRes.value || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const activeProject = projects.length > 0 ? projects[0] : null;

  if (authLoading || loading) {
    return (
      <main className="shell formPage">
        <Breadcrumbs />
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ fontSize: 18, color: 'var(--muted)' }}>⏳ Loading your Śiṣya Abhyāsa Workspace…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="shell formPage">
      <Breadcrumbs />

      {/* SECTION 1: PRIMARY HERO ACTION BANNER */}
      <section
        className="card"
        style={{
          marginTop: 16,
          background: 'linear-gradient(135deg, rgba(0, 161, 155, 0.08) 0%, rgba(79, 70, 229, 0.08) 100%)',
          border: '1px solid rgba(0, 161, 155, 0.2)',
        }}
      >
        <span className="tag">Student Command Center</span>
        <h1 style={{ fontSize: 32, margin: '12px 0 8px', fontFamily: 'Georgia, serif' }}>
          👋 Welcome back, {user?.full_name || 'Developer'}!
        </h1>

        {activeProject ? (
          <div>
            <p style={{ color: 'var(--ink)', fontSize: 16, lineHeight: 1.6, marginBottom: 16 }}>
              <strong>Current Focus:</strong> You are currently building{' '}
              <strong style={{ color: 'var(--mint)' }}>{activeProject.title}</strong> ({activeProject.difficulty} ·{' '}
              {activeProject.role}).
            </p>
            <div className="actions left">
              <Link className="btn primary" href={`/projects/${activeProject.id}`}>
                Continue Active Project Workspace →
              </Link>
              <Link className="btn secondary" href="/projects">
                View All My Projects ({projects.length})
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.6, marginBottom: 20 }}>
              You do not have an active project workspace yet. Choose how you want to start building real code evidence:
            </p>
            <div className="actions left">
              <Link className="btn primary" href="/projects/new">
                ✨ Architect a New Project Idea
              </Link>
              <Link className="btn secondary" href="/projects/discover">
                🤝 Join an Open Team Project
              </Link>
              <Link className="btn secondary" href="/discover">
                🔍 Recommended Ideas for Me
              </Link>
            </div>
          </div>
        )}
      </section>

      {error && (
        <div className="error-banner card" style={{ marginTop: 20, borderLeft: '4px solid var(--danger)' }}>
          <p style={{ color: 'var(--danger)', margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      {/* SECTION 2: 2-COLUMN DASHBOARD GRID */}
      <div className="teamSpaceGrid" style={{ marginTop: 24 }}>
        {/* LEFT COLUMN: QUICK PATHS & ACTIVE PROJECTS */}
        <div style={{ display: 'grid', gap: 20 }}>
          {/* MY PROJECTS SUMMARY */}
          <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20, margin: 0, fontFamily: 'Georgia, serif' }}>📁 My Projects</h2>
              <Link href="/projects/new" className="btn secondary" style={{ padding: '6px 12px', fontSize: 13 }}>
                + Create Project
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="notice">
                <p style={{ margin: 0 }}>No active projects found. Create your own project or join an existing team space!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="card choice"
                    style={{ padding: 16, display: 'block', textDecoration: 'none' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="tag" style={{ fontSize: 11, padding: '3px 8px' }}>
                        {p.difficulty} · {p.role}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Status: {p.status}</span>
                    </div>
                    <h3 style={{ fontSize: 16, margin: '8px 0 4px' }}>{p.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>{p.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* EXPLORE & ACTIONS GRID */}
          <section className="card">
            <h2 style={{ fontSize: 20, margin: '0 0 16px', fontFamily: 'Georgia, serif' }}>⚡ Quick Start Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <Link href="/discover" className="card choice" style={{ padding: 16, textDecoration: 'none' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>💡</div>
                <strong style={{ fontSize: 14 }}>Find Project Ideas</strong>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>Get tailored ideas matching your target role.</p>
              </Link>
              <Link href="/projects/discover" className="card choice" style={{ padding: 16, textDecoration: 'none' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>🤝</div>
                <strong style={{ fontSize: 14 }}>Community Teams</strong>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>Browse open projects seeking student collaborators.</p>
              </Link>
              <Link href="/proof" className="card choice" style={{ padding: 16, textDecoration: 'none' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>🛡️</div>
                <strong style={{ fontSize: 14 }}>Proof-of-Work</strong>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>Manage verified PR evidence and publish profile.</p>
              </Link>
              <Link href="/onboarding" className="card choice" style={{ padding: 16, textDecoration: 'none' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>👤</div>
                <strong style={{ fontSize: 14 }}>Update Profile</strong>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '4px 0 0' }}>Keep target role and skills up to date.</p>
              </Link>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: PROOF PROGRESS & AI MENTOR OBSERVATIONS */}
        <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
          {/* PROOF OF WORK WIDGET */}
          <section className="card">
            <h2 style={{ fontSize: 18, margin: '0 0 12px', fontFamily: 'Georgia, serif' }}>🛡️ Proof-of-Work Status</h2>
            {proof ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: proof.publishing.public ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {proof.publishing.public ? '🟢 Public Profile Published' : '🔒 Profile Private'}
                  </span>
                  <Link href="/proof" style={{ fontSize: 12, color: 'var(--mint)', fontWeight: 600 }}>
                    {proof.publishing.public ? 'View Public Link →' : 'Publish →'}
                  </Link>
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                  {proof.projects.length} evidence-backed project(s) ready for recruiters.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--muted)' }}>Loading Proof-of-Work status…</p>
            )}
          </section>

          {/* AI MENTOR OBSERVATIONS */}
          <section className="card">
            <h2 style={{ fontSize: 18, margin: '0 0 12px', fontFamily: 'Georgia, serif' }}>🧠 AI Mentor Feed</h2>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>Proactive contextual guidance for your projects.</p>

            {observations.length === 0 ? (
              <div className="notice" style={{ padding: 12, fontSize: 13 }}>
                Connect your project to GitHub to receive real-time review observations on merged PRs.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {observations.slice(0, 3).map((obs) => (
                  <div
                    key={obs.id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: 'rgba(0, 161, 155, 0.04)',
                      borderLeft: '3px solid var(--mint)',
                    }}
                  >
                    <strong style={{ fontSize: 13, display: 'block', marginBottom: 2 }}>{obs.title}</strong>
                    <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>{obs.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
