import React from 'react';

const stages = [
  {
    num: '01',
    name: 'Discover',
    tag: 'Match & Choose',
    desc: 'Get AI-recommended project ideas matched to your target role, or discover open community projects seeking collaborators.'
  },
  {
    num: '02',
    name: 'Learn',
    tag: 'Architect & Plan',
    desc: 'Review structured milestone roadmaps, task completion criteria, and scoped learning resources before writing a line of code.'
  },
  {
    num: '03',
    name: 'Build',
    tag: 'Execute & Connect',
    desc: 'Work through interactive Kanban tasks in your workspace and connect your real GitHub repository to track evidence.'
  },
  {
    num: '04',
    name: 'Collaborate',
    tag: 'Team & Communicate',
    desc: 'Invite teammates, accept community join requests, and chat in Team Space using Task #N and PR #N references.'
  },
  {
    num: '05',
    name: 'Prove',
    tag: 'Verify & Share',
    desc: 'Automatically extract demonstrated skill evidence from merged PRs into a privacy-safe, shareable Proof-of-Work link.'
  }
];

export default function FiveStageJourney() {
  return (
    <section className="journeySection" aria-labelledby="journey-heading">
      <div className="sectionHeader">
        <span className="tag">Product Vision Journey</span>
        <h2 id="journey-heading">How Śiṣya Abhyāsa Works</h2>
        <p className="sectionSub">
          A continuous 5-stage pipeline designed to take you from a curious beginner to a recruiter-trusted developer.
        </p>
      </div>

      <div className="journeyPipeline" role="list">
        {stages.map((s, idx) => (
          <div key={s.name} className="journeyStage" role="listitem">
            <div className="stageHeader">
              <span className="stageNum">{s.num}</span>
              <span className="stageTag">{s.tag}</span>
            </div>
            <h3 className="stageName">{s.name}</h3>
            <p className="stageDesc">{s.desc}</p>
            {idx < stages.length - 1 && <div className="stageConnector" aria-hidden="true">→</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
