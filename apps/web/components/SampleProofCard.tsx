import React from 'react';

export default function SampleProofCard() {
  return (
    <section className="sampleProofSection" id="sample-proof" aria-labelledby="proof-card-heading">
      <div className="sectionHeader">
        <span className="tag">Evidence-Based Showcase</span>
        <h2 id="proof-card-heading">Sample Proof-of-Work Card</h2>
        <p className="sectionSub">
          Here is what recruiters see when you share your privacy-safe proof link: real project evidence derived from merged GitHub pull requests.
        </p>
      </div>

      <div className="proofCardShell">
        <div className="proofCardHeader">
          <div className="proofStudentInfo">
            <div className="avatarBadge">AS</div>
            <div>
              <h3 className="studentName">Alice Student</h3>
              <span className="studentRole">Target Role: Full-Stack Developer</span>
            </div>
          </div>
          <div className="proofStatusBadge">
            <span className="statusDot"></span> Public Profile Active
          </div>
        </div>

        <div className="proofSkillsGrid">
          <div className="skillBadgeItem">
            <strong>FastAPI</strong>
            <span>Demonstrated 2x</span>
          </div>
          <div className="skillBadgeItem">
            <strong>Python</strong>
            <span>Demonstrated 3x</span>
          </div>
          <div className="skillBadgeItem">
            <strong>PostgreSQL</strong>
            <span>Demonstrated 1x</span>
          </div>
        </div>

        <div className="proofProjectBlock">
          <div className="projectBlockHeader">
            <h4>Project: Campus Event Discovery API</h4>
            <span className="visibilityTag">Private Repository</span>
          </div>
          <p className="projectDesc">
            RESTful event discovery service with JWT authentication, role-based access control, and PostgreSQL persistence.
          </p>

          <div className="contributionList">
            <div className="contributionItem">
              <span className="prChip">PR #1 (Merged)</span>
              <div>
                <strong>Implement JWT Authentication & Refresh Tokens</strong>
                <p>Linked Task: <em>Task 1.1 — Auth & User Profile API</em></p>
                <small className="attributionNote">
                  Attributed evidence: Demonstrated FastAPI & Python application via task-linked merged PR.
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="proofTrustFooter">
          <span className="shieldIcon">🛡️</span>
          <p>
            <strong>Evidence Trust Guarantee:</strong> Evidence is extracted automatically from verified merged pull requests linked to project tasks. Source code, credentials, and raw diffs remain private.
          </p>
        </div>
      </div>
    </section>
  );
}
