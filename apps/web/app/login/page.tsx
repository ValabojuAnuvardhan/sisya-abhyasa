'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginStudent } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { saveAuthToken } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginStudent(email, password);
      if (res?.token) {
        saveAuthToken(res.token);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell formPage" style={{ maxWidth: 480, margin: '40px auto' }}>
      <div className="card" style={{ padding: 32, borderRadius: 18, background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <span className="tag">
            Śiṣya Abhyāsa
          </span>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink)', marginTop: 12, marginBottom: 8, fontFamily: 'Georgia, serif' }}>
            Sign in to your account
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>
            Access your live workspace, proof-of-work, and verified skills.
          </p>
        </div>

        {error && (
          <div className="error-banner card" style={{ background: 'rgba(220, 38, 38, 0.08)', borderLeft: '4px solid #dc2626', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 6, fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              style={{ padding: 12, borderRadius: 999, border: '1px solid rgba(0,0,0,0.16)', background: '#f7f2eb', fontSize: 14 }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6, fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ padding: 12, borderRadius: 999, border: '1px solid rgba(0,0,0,0.16)', background: '#f7f2eb', fontSize: 14 }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn primary"
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--mint)', fontWeight: 600, textDecoration: 'none' }}>
            Create student account
          </Link>
        </div>
      </div>
    </main>
  );
}
