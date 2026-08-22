'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageBack from '../../components/PageBack';
import { loginStudent, registerStudent } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

const DEMO_USERS = [
  { email: 'student1@gmail.com', name: 'Alex Rivera', role: 'Full Stack Engineer' },
  { email: 'student2@gmail.com', name: 'Priya Patel', role: 'AI & ML Engineer' },
  { email: 'student3@gmail.com', name: 'Arun Sharma', role: 'Backend Architect' },
  { email: 'student4@gmail.com', name: 'Sophia Chen', role: 'Frontend UI/UX' },
  { email: 'student5@gmail.com', name: 'David Miller', role: 'DevOps & Cloud' },
  { email: 'student6@gmail.com', name: 'Ananya Roy', role: 'Data Engineer' },
  { email: 'student7@gmail.com', name: 'Liam Wilson', role: 'Mobile App Dev' },
  { email: 'student8@gmail.com', name: 'Zara Ahmed', role: 'Security Engineer' },
  { email: 'student9@gmail.com', name: 'Marcus Vance', role: 'Distributed Systems' },
  { email: 'student10@gmail.com', name: 'Elena Rostova', role: 'QA Automation' },
  { email: 'student11@gmail.com', name: 'Rohan Gupta', role: 'Cloud Native' },
  { email: 'student12@gmail.com', name: 'Emma Watson', role: 'Product Engineer' },
  { email: 'student13@gmail.com', name: 'Karthik Nair', role: 'Embedded & IoT' },
  { email: 'student14@gmail.com', name: 'Chloe Bennett', role: 'Web Performance' },
  { email: 'student15@gmail.com', name: 'Vikram Singh', role: 'Database Architect' },
  { email: 'student16@gmail.com', name: 'Maya Lin', role: 'NLP & LLM Engineer' },
  { email: 'student17@gmail.com', name: 'Noah Taylor', role: 'Site Reliability (SRE)' },
  { email: 'student18@gmail.com', name: 'Aaliyah Khan', role: 'Microservices' },
  { email: 'student19@gmail.com', name: 'James O\'Connor', role: 'Blockchain Dev' },
  { email: 'student20@gmail.com', name: 'Tanya Verma', role: 'Core Software Eng' },
];

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('student1@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [githubUrl, setGithubUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { saveAuthToken } = useAuth();

  function selectDemoUser(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let res;
      if (mode === 'signup') {
        res = await registerStudent(email, password, githubUrl || 'https://github.com/student');
      } else {
        res = await loginStudent(email, password);
      }
      if (res?.token) {
        saveAuthToken(res.token, res.user_id, email);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="shell formPage" style={{ maxWidth: 540, marginTop: 40, marginBottom: 60 }}>
      <PageBack href="/" label="Back to Home" />

      <section
        className="card"
        style={{
          padding: 36,
          borderRadius: 20,
          background: 'var(--card-bg, #eee8df)',
          border: '1px solid var(--card-border, rgba(0,0,0,0.08))',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span
            className="tag"
            style={{
              background: 'rgba(0, 161, 155, 0.12)',
              color: 'var(--mint, #00a19b)',
              padding: '6px 14px',
              borderRadius: 20,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Śiṣya Abhyāsa Workspace
          </span>

          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--ink, #1a1410)',
              marginTop: 12,
              marginBottom: 8,
              fontFamily: 'Georgia, serif',
            }}
          >
            {mode === 'login' ? 'Sign in to Śiṣya' : 'Create student account'}
          </h1>
          <p style={{ color: 'var(--muted, #7a6f67)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
            {mode === 'login'
              ? 'Access your workspace, proof-of-work graph, and verified skills.'
              : 'Register your email and GitHub profile to start building verified evidence.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 12,
            padding: 4,
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              background: mode === 'login' ? '#1a1410' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--muted, #7a6f67)',
              transition: 'all 0.2s ease',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              background: mode === 'signup' ? '#1a1410' : 'transparent',
              color: mode === 'signup' ? '#ffffff' : 'var(--muted, #7a6f67)',
              transition: 'all 0.2s ease',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Demo User Quick Selector */}
        <div
          style={{
            marginBottom: 20,
            padding: 14,
            borderRadius: 12,
            background: 'rgba(0, 161, 155, 0.06)',
            border: '1px solid rgba(0, 161, 155, 0.2)',
          }}
        >
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink, #1a1410)', display: 'block', marginBottom: 6 }}>
            ⚡ Demo Student Profiles (20 Pre-Seeded Accounts):
          </label>
          <select
            value={email}
            onChange={(e) => selectDemoUser(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid rgba(0, 0, 0, 0.15)',
              background: '#ffffff',
              color: '#1a1410',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {DEMO_USERS.map((u, idx) => (
              <option key={u.email} value={u.email}>
                Student #{idx + 1}: {u.name} ({u.role}) — {u.email}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div
            className="error-banner card"
            style={{
              marginBottom: 20,
              borderLeft: '4px solid #dc2626',
              padding: 12,
              background: 'rgba(220, 38, 38, 0.08)',
              color: '#991b1b',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6, fontWeight: 600, fontSize: 14, color: 'var(--ink, #1a1410)' }}>
            Email address
            <input
              name="email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.16)',
                padding: '12px 14px',
                borderRadius: 10,
                color: '#1a1410',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, fontWeight: 600, fontSize: 14, color: 'var(--ink, #1a1410)' }}>
            Password
            <input
              name="password"
              type="password"
              placeholder="At least 6 characters"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.16)',
                padding: '12px 14px',
                borderRadius: 10,
                color: '#1a1410',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </label>

          {mode === 'signup' && (
            <label style={{ display: 'grid', gap: 6, fontWeight: 600, fontSize: 14, color: 'var(--ink, #1a1410)' }}>
              GitHub Profile URL
              <input
                name="github_url"
                type="url"
                placeholder="https://github.com/student"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0,0,0,0.16)',
                  padding: '12px 14px',
                  borderRadius: 10,
                  color: '#1a1410',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </label>
          )}

          <button
            className="btn primary"
            type="submit"
            disabled={submitting}
            style={{
              marginTop: 8,
              background: 'var(--mint, #00a19b)',
              color: '#ffffff',
              fontWeight: 700,
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: 15,
              transition: 'background 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 161, 155, 0.25)',
            }}
          >
            {submitting ? 'Authenticating...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--muted, #7a6f67)', marginBottom: 8, margin: 0 }}>
            {mode === 'login' ? "Don't have an account yet?" : 'Already registered?'}
          </p>
          <button
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--mint, #00a19b)',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14,
              marginTop: 4,
            }}
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Create a new student account' : 'Sign in to existing account'}
          </button>
        </div>
      </section>
    </main>
  );
}
