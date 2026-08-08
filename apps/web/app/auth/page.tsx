'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuthToken } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import PageBack from '../../components/PageBack';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devToken, setDevToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { refetchUser } = useAuth();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);
    const f = new FormData(e.currentTarget);
    try {
      if (mode === 'signup') {
        const r = await api('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ email: f.get('email'), password: f.get('password'), full_name: f.get('full_name') })
        });
        setMessage(r.message || 'Account created successfully. Please verify your email.');
        if (r.development_verification_token) {
          setDevToken(r.development_verification_token);
        }
      } else {
        const res = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: f.get('email'), password: f.get('password') })
        });
        if (res.access_token) {
          setAuthToken(res.access_token);
        }
        const userProfile = await refetchUser();
        if (userProfile && !userProfile.onboarding_completed) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  }

  async function verify() {
    setError('');
    setMessage('');
    try {
      await api('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token: devToken })
      });
      setMessage('Email verified successfully! You can sign in now.');
      setMode('login');
      setDevToken('');
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  }

  return (
    <main className="shell formPage" style={{ maxWidth: 560, marginTop: 40 }}>
      <PageBack href="/" label="Back to Home" />
      <section className="card">
        <span className="tag">Student account</span>
        <h1>{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
          {mode === 'login'
            ? 'Continue your project workspaces, tasks, and evidence portfolio.'
            : 'Create a private student account. Your Proof-of-Work remains private until you publish it.'}
        </p>

        {error && (
          <div className="error-banner card" style={{ marginBottom: 16, borderLeft: '4px solid var(--danger)', padding: 12 }}>
            <p style={{ color: 'var(--danger)', margin: 0, fontWeight: 600 }}>⚠️ {error}</p>
          </div>
        )}

        {message && (
          <div className="notice" style={{ marginBottom: 16 }}>
            <p style={{ margin: 0 }}>ℹ️ {message}</p>
          </div>
        )}

        <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          {mode === 'signup' && (
            <label style={{ display: 'grid', gap: 6, fontWeight: 500 }}>
              Full name
              <input name="full_name" placeholder="e.g. Anuvardhan" required maxLength={120} />
            </label>
          )}
          <label style={{ display: 'grid', gap: 6, fontWeight: 500 }}>
            Email address
            <input name="email" type="email" placeholder="student@example.com" required />
          </label>
          <label style={{ display: 'grid', gap: 6, fontWeight: 500 }}>
            Password
            <input name="password" type="password" placeholder="At least 10 characters" minLength={10} required />
          </label>
          <button className="btn primary" type="submit" disabled={submitting} style={{ marginTop: 8 }}>
            {submitting ? 'Authenticating…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {devToken && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <button className="btn secondary" type="button" onClick={verify} style={{ width: '100%' }}>
              ⚡ Auto-Verify Email (Development Mode)
            </button>
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {mode === 'login' ? "Don't have an account yet?" : 'Already registered?'}
          </p>
          <button
            className="btn secondary"
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setMessage('');
              setError('');
              setDevToken('');
            }}
          >
            {mode === 'login' ? 'Create a new account' : 'Sign in to existing account'}
          </button>
        </div>
      </section>
    </main>
  );
}
