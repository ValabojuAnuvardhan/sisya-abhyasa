'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageBack from '../../components/PageBack';
import { loginStudent, registerStudent } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { saveAuthToken } = useAuth();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const f = new FormData(e.currentTarget);
    const email = f.get('email') as string;
    const password = f.get('password') as string;
    const githubUrl = (f.get('github_url') as string) || 'https://github.com/student';

    try {
      let res;
      if (mode === 'signup') {
        res = await registerStudent(email, password, githubUrl);
      } else {
        res = await loginStudent(email, password);
      }
      if (res?.token) {
        saveAuthToken(res.token);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="shell formPage" style={{ maxWidth: 520, marginTop: 40 }}>
      <PageBack href="/" label="Back to Home" />
      <section className="card" style={{ padding: 32, borderRadius: 18, background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <span className="tag" style={{ background: 'rgba(0, 161, 155, 0.12)', color: 'var(--mint)', padding: '4px 12px', borderRadius: 20, fontWeight: 600, fontSize: 13 }}>
          Student Account
        </span>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', marginTop: 12, marginBottom: 8, fontFamily: 'Georgia, serif' }}>
          {mode === 'login' ? 'Sign in to Śiṣya' : 'Create student account'}
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 14, lineHeight: 1.5 }}>
          {mode === 'login'
            ? 'Access your workspace, live evidence graph, and verified skills.'
            : 'Register your email and GitHub profile to start generating evidence.'}
        </p>

        {error && (
          <div className="error-banner card" style={{ marginBottom: 16, borderLeft: '4px solid #dc2626', padding: 12, background: 'rgba(220, 38, 38, 0.08)', color: '#991b1b', borderRadius: 8, fontSize: 14 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6, fontWeight: 500, fontSize: 14, color: '#d1d5db' }}>
            Email address
            <input name="email" type="email" placeholder="student@example.com" required style={{ background: '#1f2937', border: '1px solid #374151', padding: '10px 14px', borderRadius: 8, color: '#fff', fontSize: 14 }} />
          </label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 500, fontSize: 14, color: '#d1d5db' }}>
            Password
            <input name="password" type="password" placeholder="At least 6 characters" minLength={6} required style={{ background: '#1f2937', border: '1px solid #374151', padding: '10px 14px', borderRadius: 8, color: '#fff', fontSize: 14 }} />
          </label>
          {mode === 'signup' && (
            <label style={{ display: 'grid', gap: 6, fontWeight: 500, fontSize: 14, color: '#d1d5db' }}>
              GitHub Profile URL
              <input name="github_url" type="text" placeholder="https://github.com/student" required style={{ background: '#1f2937', border: '1px solid #374151', padding: '10px 14px', borderRadius: 8, color: '#fff', fontSize: 14 }} />
            </label>
          )}
          <button className="btn primary" type="submit" disabled={submitting} style={{ marginTop: 8, background: '#34d399', color: '#064e3b', fontWeight: 600, padding: 12, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 15 }}>
            {submitting ? 'Authenticating…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid #1f2937', paddingTop: 16 }}>
          <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>
            {mode === 'login' ? "Don't have an account yet?" : 'Already registered?'}
          </p>
          <button
            type="button"
            style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? 'Create a new account' : 'Sign in to existing account'}
          </button>
        </div>
      </section>
    </main>
  );
}
