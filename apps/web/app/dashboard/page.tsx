import React from 'react';
import PageBack from '../../components/PageBack';

const starts = [
  ['My projects', '/projects'],
  ['My Proof-of-Work', '/proof'],
  ['Find me a project', '/discover'],
  ['I have a project idea', '/projects/new'],
  ['Explore projects to join', '/projects/discover']
];

export default function Dashboard() {
  return (
    <main className="shell formPage">
      <PageBack href="/" label="Back to Home" />
      <span className="tag">Dashboard · activation</span>
      <h1>How would you like to start?</h1>
      <p className="lead">Come with an idea—or without one. Start with the path that fits you.</p>
      <div className="grid">
        {starts.map(([t, h]) => (
          <a className="card choice" href={h} key={t}>
            <h3>{t}</h3>
            <p>
              {t === 'My projects'
                ? 'Continue your active project workspace and tasks.'
                : t === 'My Proof-of-Work'
                ? 'Preview evidence-backed contributions and control public publishing.'
                : t === 'Find me a project'
                ? 'Get 3–5 realistic ideas matched to your goals.'
                : t === 'I have a project idea'
                ? 'Turn your own idea into an executable plan.'
                : 'Browse community projects that explicitly need collaborators.'}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
