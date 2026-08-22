'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageBack from '../../components/PageBack';
import { loginStudent } from '../../lib/api';
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

export default function LoginPage() {
  const [email, setEmail] = useState('student1@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { saveAuthToken } = useAuth();

  function selectDemoUser(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('Password123!');
    setError('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginStudent(email, password);
      if (res?.token) {
        saveAuthToken(res.token, res.user_id, email);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials');
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
            Sign in to your account
          </h1>
          <p style={{ color: 'var(--muted, #7a6f67)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
            Access your live workspace, proof-of-work graph, and verified skills.
          </p>
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
            ⚡ Quick Demo Accounts (Select from 20 Students):
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
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--muted, #7a6f67)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--mint, #00a19b)', fontWeight: 700, textDecoration: 'none' }}>
            Create student account
          </Link>
        </div>
      </div>
    </main>
  );
}
