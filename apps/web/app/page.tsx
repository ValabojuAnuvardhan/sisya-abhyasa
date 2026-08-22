import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* TOP PILL TAG */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span
          style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: 999,
            backgroundColor: 'rgba(0, 161, 155, 0.1)',
            color: '#00a19b',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          Learn · Build · Collaborate · Prove
        </span>
      </div>

      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1
          style={{
            fontSize: 'clamp(44px, 6vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.08,
            color: '#0f172a',
            margin: '0 0 20px',
            letterSpacing: '-1.5px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          Build experience before{' '}
          <em
            style={{
              color: '#00a19b',
              fontStyle: 'italic',
              fontWeight: 800,
            }}
          >
            you are asked to prove it.
          </em>
        </h1>
        <p
          style={{
            maxWidth: 680,
            margin: '0 auto 36px',
            color: '#64748b',
            fontSize: 17,
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Discover a project or bring your own idea, learn what you need while building, collaborate with students, and turn real contributions into evidence of your skills.
        </p>

        {/* CTA BUTTONS */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/auth"
            style={{
              textDecoration: 'none',
              padding: '14px 28px',
              borderRadius: 12,
              backgroundColor: '#00a19b',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: 15,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(0, 161, 155, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            Get Started Free →
          </Link>
          <Link
            href="/projects/new"
            style={{
              textDecoration: 'none',
              padding: '14px 28px',
              borderRadius: 12,
              backgroundColor: '#ffffff',
              color: '#1e293b',
              fontWeight: 600,
              fontSize: 15,
              border: '1px solid #cbd5e1',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease',
            }}
          >
            Find a Project Idea
          </Link>
        </div>
      </section>

      {/* HOW WOULD YOU LIKE TO START SECTION */}
      <section style={{ marginTop: 60 }}>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: 24,
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          }}
        >
          How would you like to start?
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {/* CARD 1: FIND ME A PROJECT */}
          <Link
            href="/discover"
            style={{
              textDecoration: 'none',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: 28,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              <div style={{ fontSize: 32, marginBottom: 16 }}>✨</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                Find me a project
              </h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                Get AI-recommended project ideas tailored to your target role and skill level.
              </p>
            </div>
            <div style={{ marginTop: 24, color: '#00a19b', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              Get Project Recommendations →
            </div>
          </Link>

          {/* CARD 2: I HAVE A PROJECT IDEA */}
          <Link
            href="/projects/new"
            style={{
              textDecoration: 'none',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: 28,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🛠️</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                I have a project idea
              </h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                Architect your project concept into structured milestones, tasks, and skill tags.
              </p>
            </div>
            <div style={{ marginTop: 24, color: '#00a19b', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              Architect My Idea →
            </div>
          </Link>

          {/* CARD 3: EXPLORE PROJECTS TO JOIN */}
          <Link
            href="/projects/discover"
            style={{
              textDecoration: 'none',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: 28,
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🤝</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
                Explore projects to join
              </h3>
              <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                Browse active peer student projects seeking collaborators and submit join requests.
              </p>
            </div>
            <div style={{ marginTop: 24, color: '#00a19b', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              Browse Open Teams →
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
