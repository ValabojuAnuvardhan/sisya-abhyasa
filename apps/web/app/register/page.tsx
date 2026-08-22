'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageBack from '../../components/PageBack';
import { registerStudent } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { saveAuthToken } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await registerStudent(email, password, githubUrl || '');
      if (res?.token) {
        saveAuthToken(res.token, res.user_id, email);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell formPage" style={{ maxWidth: 540, marginTop: 40, marginBottom: 60 }}>
      <PageBack href="/" label="Back to Home" />

      <div
        className="card"
        style={{
          padding: 36,
          borderRadius: 20,
          background: 'var(--card-bg, #eee8df)',
          border: '1px solid var(--card-border, rgba(0,0,0,0.08))',
          boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
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
            Create student account
          </h1>
          <p style={{ color: 'var(--muted, #7a6f67)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
            Register your email and GitHub profile to build verified proof-of-work.
          </p>
        </div>

        {error && (
          <div
            className="error-banner card"
            style={{
              background: 'rgba(220, 38, 38, 0.08)',
              borderLeft: '4px solid #dc2626',
              color: '#991b1b',
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 14, color: 'var(--ink, #1a1410)', fontWeight: 600 }}>
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.16)',
                background: '#ffffff',
                color: '#1a1410',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, fontSize: 14, color: 'var(--ink, #1a1410)', fontWeight: 600 }}>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.16)',
                background: '#ffffff',
                color: '#1a1410',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, fontSize: 14, color: 'var(--ink, #1a1410)', fontWeight: 600 }}>
            GitHub Profile URL (Optional)
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/yourusername"
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.16)',
                background: '#ffffff',
                color: '#1a1410',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn primary"
            style={{
              width: '100%',
              marginTop: 8,
              background: 'var(--mint, #00a19b)',
              color: '#ffffff',
              fontWeight: 700,
              padding: '14px',
              borderRadius: 10,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 15,
              boxShadow: '0 4px 12px rgba(0, 161, 155, 0.25)',
            }}
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--muted, #7a6f67)' }}>
          Already registered?{' '}
          <Link href="/login" style={{ color: 'var(--mint, #00a19b)', fontWeight: 700, textDecoration: 'none' }}>
            Sign in to your account
          </Link>
        </div>
      </div>
    </main>
  );
}
