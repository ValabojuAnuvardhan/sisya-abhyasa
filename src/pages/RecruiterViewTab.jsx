import { useState } from "react";

export default function RecruiterViewTab() {
  const [profile] = useState({
    name: "Anuvardhan Valaboju",
    headline: "Full Stack Software Engineer | React, FastAPI & Cloud Systems",
    username: "anuvardhan",
    targetRole: "Senior Software Engineer",
    publicUrl: "/recruiter/anuvardhan",
    collaborationScore: 92.5,
    mergedPrs: 18,
    commits: 142,
    evidenceCards: [
      {
        title: "Decoupled Telemetry Sensor Architecture",
        type: "Architecture Spec",
        pr: "https://github.com/sisya-abhyasa/core/pull/42",
        verified: true,
        summary: "Architected isolated telemetry ingestion pipeline consuming real-time GitHub webhooks."
      },
      {
        title: "Dynamic Skill Graph Inferencing Engine",
        type: "Merged Pull Request",
        pr: "https://github.com/sisya-abhyasa/core/pull/45",
        verified: true,
        summary: "Implemented 7-parameter dynamic scoring model with exact 2-decimal rounding precision."
      }
    ],
    projects: [
      {
        title: "Śiṣya Abhyāsa Core Platform",
        badge: "Production Ready",
        score: 94.5,
        summary: "AI-driven employability platform replacing traditional resumes with verified telemetry proof of work."
      }
    ]
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header Profile Card */}
      <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.04)", marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#00A19B", background: "rgba(0,161,155,0.08)", padding: "4px 10px", borderRadius: 12 }}>
              Verified Recruiter Portfolio
            </span>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111", margin: "12px 0 6px 0" }}>{profile.name}</h1>
            <p style={{ fontSize: 16, color: "#4b5563", margin: 0, maxWidth: 650 }}>{profile.headline}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Public URL:</span>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", background: "#eff6ff", padding: "6px 12px", borderRadius: 8, marginTop: 4 }}>
              https://sisya-abhyasa.io{profile.publicUrl}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 28, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Collaboration Score</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#00A19B" }}>{profile.collaborationScore}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Merged Pull Requests</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1e293b" }}>{profile.mergedPrs}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Verified Commits</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1e293b" }}>{profile.commits}</div>
          </div>
        </div>
      </div>

      {/* Evidence Cards Section */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 16 }}>Verified Proof-of-Work Evidence</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {profile.evidenceCards.map((card, idx) => (
            <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{card.title}</span>
                <span style={{ fontSize: 12, color: "#059669", background: "#ecfdf5", padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>
                  ✓ {card.type} Verified
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#475569", margin: "0 0 12px 0" }}>{card.summary}</p>
              <a href={card.pr} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
                View GitHub Telemetry PR →
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
