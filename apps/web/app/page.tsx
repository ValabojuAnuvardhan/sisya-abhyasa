import React from 'react';
import Link from 'next/link';
import FiveStageJourney from '../components/FiveStageJourney';
import SampleProofCard from '../components/SampleProofCard';

const starts = [
  {
    icon: '✨',
    title: '1. Find a Project',
    desc: 'Get AI-recommended project ideas tailored to your target role and skills.',
    href: '/discover',
    cta: 'Find a Project Idea'
  },
  {
    icon: '🛠️',
    title: '2. Bring Your Own Idea',
    desc: 'Turn your custom project concept into a structured milestone & task plan.',
    href: '/projects/new',
    cta: 'Architect My Idea'
  },
  {
    icon: '🤝',
    title: '3. Join a Project',
    desc: 'Discover open community projects seeking student collaborators.',
    href: '/projects/discover',
    cta: 'Browse Open Teams'
  }
];

const benefits = [
  {
    icon: '🛡️',
    title: 'Verified Evidence',
    desc: 'Attributed directly from merged GitHub PRs linked to tasks — never commit counts or unverified claims.'
  },
  {
    icon: '🧠',
    title: 'Contextual Learning',
    desc: 'Learn what you need while building with task-scoped completion criteria and an AI Contextual Mentor.'
  },
  {
    icon: '👥',
    title: 'Peer Collaboration',
    desc: 'Build together in team spaces with structured Task #N and PR #N mentions and open meeting links.'
  },
  {
    icon: '🔗',
    title: 'Privacy-Safe Proof',
    desc: 'Share opaque, recruiter-ready profile links while keeping your private repositories, code, and secrets safe.'
  }
];

export default function Home() {
  return (
    <>
      <header className="shell nav" role="banner">
        <Link className="brand" href="/" aria-label="Śiṣya Abhyāsa Home">
          Śiṣya Abhyāsa
        </Link>
        <nav className="navlinks" aria-label="Main Navigation">
          <Link href="/discover">Discover</Link>
          <Link href="/projects/discover">Community</Link>
          <a href="#sample-proof">Sample Proof</a>
          <Link href="/auth">Sign In</Link>
        </nav>
        <Link className="btn primary" href="/auth">
          Get Started
        </Link>
      </header>

      <main className="shell" id="main-content">
        {/* SECTION 1: HERO SECTION */}
        <section className="hero" aria-labelledby="hero-title">
          <span className="tag">Discover · Learn · Build · Collaborate · Prove</span>
          <h1 id="hero-title">
            Build Real Projects.<br />
            <em>Demonstrate Verified Skills.</em>
          </h1>
          <p>
            Stop building generic tutorials. Turn your real code contributions and merged pull requests into privacy-safe, evidence-backed proof of work that recruiters trust.
          </p>
          <div className="actions">
            <Link className="btn primary" href="/auth" aria-label="Start Building with Śiṣya Abhyāsa">
              Start Building
            </Link>
            <a className="btn secondary" href="#sample-proof" aria-label="View Sample Proof-of-Work Card">
              View Sample Proof
            </a>
          </div>
        </section>

        {/* SECTION 2: PROBLEM VS SOLUTION SECTION */}
        <section className="problemSection" aria-labelledby="problem-heading">
          <div className="sectionHeader">
            <span className="tag">Why Śiṣya Abhyāsa</span>
            <h2 id="problem-heading">Certificates Aren’t Enough Anymore</h2>
            <p className="sectionSub">
              Recruiters ignore online completion badges and static resume claims. They want to see real evidence of your application skills.
            </p>
          </div>
          <div className="problemGrid">
            <div className="problemBox">
              <h3>The Resume & Certificate Problem</h3>
              <p>
                Course completion certificates, tutorial clones, and raw commit counts are easily spoofed or copied. They show you watched videos, not that you can solve real technical problems.
              </p>
            </div>
            <div className="solutionBox">
              <h3>The Evidence-Based Solution</h3>
              <p>
                Śiṣya Abhyāsa extracts demonstrated skill evidence directly from merged GitHub Pull Requests linked to project tasks. Your code remains private while your demonstrated skills speak for themselves.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: FIVE-STAGE JOURNEY */}
        <FiveStageJourney />

        {/* SECTION 4: THREE ENTRY PATHS */}
        <section className="card" style={{ marginTop: 40 }} aria-labelledby="entry-paths-heading">
          <div className="sectionHeader">
            <span className="tag">Flexible Entry</span>
            <h2 id="entry-paths-heading">Three Ways to Start Building</h2>
            <p className="sectionSub">
              Whether you need an idea, have a concept in mind, or want to join an active team, pick the path that fits your goals.
            </p>
          </div>
          <div className="grid">
            {starts.map(x => (
              <Link className="card choice" href={x.href} key={x.title} aria-label={`${x.title}: ${x.desc}`}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{x.icon}</div>
                <h3>{x.title}</h3>
                <p>{x.desc}</p>
                <span className="btn secondary" style={{ marginTop: 14, display: 'inline-block', fontSize: 13 }}>
                  {x.cta} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* SECTION 5: BENEFITS SECTION */}
        <section className="benefitsSection" aria-labelledby="benefits-heading">
          <div className="sectionHeader">
            <span className="tag">Platform Pillars</span>
            <h2 id="benefits-heading">Designed for Student Success</h2>
            <p className="sectionSub">
              Four core pillars that support your transition from learning syntax to shipping real projects.
            </p>
          </div>
          <div className="benefitGrid">
            {benefits.map(b => (
              <div key={b.title} className="benefitCard">
                <div className="benefitIcon" aria-hidden="true">{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: SAMPLE PROOF-OF-WORK CARD */}
        <SampleProofCard />

        {/* SECTION 7: FINAL CALL TO ACTION BANNER */}
        <section className="ctaBannerSection" aria-labelledby="cta-heading">
          <div className="ctaCard">
            <h2 id="cta-heading">Ready to Prove Your Skills?</h2>
            <p>
              Join students building real projects, connecting GitHub repositories, and creating recruiter-trusted proof of work.
            </p>
            <div className="actions">
              <Link className="btn primary" href="/auth" style={{ padding: '14px 28px', fontSize: 16 }}>
                Start Building Your Proof-of-Work
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="shell footerShell" role="contentinfo">
        <div>© 2026 Śiṣya Abhyāsa. Release Candidate v1.0.0-rc1</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/discover" style={{ color: 'inherit', textDecoration: 'none' }}>Discover</Link>
          <Link href="/projects/discover" style={{ color: 'inherit', textDecoration: 'none' }}>Community</Link>
          <Link href="/auth" style={{ color: 'inherit', textDecoration: 'none' }}>Sign In</Link>
        </div>
      </footer>
    </>
  );
}
