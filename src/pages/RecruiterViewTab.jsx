import { useState } from "react";

export default function RecruiterViewTab({ setActiveTab }) {
  const [copied, setCopied] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);

  const [profile] = useState({
    name: "Student Builder Portfolio",
    headline: "Full Stack Software Engineer | React, FastAPI & Cloud Systems",
    username: "student-portfolio",
    targetRole: "Senior Software Engineer",
    githubRepo: "https://github.com/sisya-abhyasa",
    collaborationScore: 92.5,
    mergedPrs: 18,
    commits: 142,
    evidenceCards: [
      {
        id: "ev-01",
        title: "Decoupled Telemetry Sensor Architecture",
        type: "Architecture Spec",
        pr: "https://github.com/ValabojuAnuvardhan/sisya-abhyasa",
        verified: true,
        summary: "Architected isolated telemetry ingestion pipeline consuming real-time GitHub webhooks.",
        hmac: "sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        impact: "Reduced webhook latency from 450ms to 42ms with zero-loss asynchronous queue processing."
      },
      {
        id: "ev-02",
        title: "Dynamic Skill Graph Inferencing Engine",
        type: "Merged Pull Request",
        pr: "https://github.com/ValabojuAnuvardhan/sisya-abhyasa",
        verified: true,
        summary: "Implemented 7-parameter dynamic scoring model with exact 2-decimal rounding precision.",
        hmac: "sha256-8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
        impact: "Calculates real-time skill growth metrics across Python, React, REST APIs, and Git commits."
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

  const getPortfolioUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/#recruiter`;
    }
    return "https://sisya-abhyasa-v10.vercel.app/#recruiter";
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(getPortfolioUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Evidence Modal */}
      {selectedEvidence && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, maxWidth: 600, width: "100%", padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#00A19B", background: "rgba(0,161,155,0.1)", padding: "4px 10px", borderRadius: 12 }}>
                ✓ {selectedEvidence.type} Verified
              </span>
              <button onClick={() => setSelectedEvidence(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#666" }}>✕</button>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", margin: "0 0 12px 0" }}>{selectedEvidence.title}</h2>
            <p style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>{selectedEvidence.summary}</p>

            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>HMAC Telemetry Proof Signature</div>
              <code style={{ fontSize: 11, color: "#0f172a", wordBreak: "break-all" }}>{selectedEvidence.hmac}</code>
              <div style={{ fontSize: 13, color: "#059669", fontWeight: 600, marginTop: 12 }}>Key Contribution Impact:</div>
              <div style={{ fontSize: 13, color: "#334155", marginTop: 2 }}>{selectedEvidence.impact}</div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedEvidence(null)} className="ghost-btn" style={{ padding: "10px 20px" }}>Close</button>
              <a href={selectedEvidence.pr} target="_blank" rel="noreferrer" className="mint-btn" style={{ textDecoration: "none", padding: "10px 20px" }}>
                Inspect Repository on GitHub →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Card */}
      <div style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, padding: 32, boxShadow: "0 4px 24px rgba(0,0,0,0.04)", marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#00A19B", background: "rgba(0,161,155,0.08)", padding: "4px 10px", borderRadius: 12 }}>
              Verified Recruiter Portfolio
            </span>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111", margin: "12px 0 6px 0" }}>{profile.name}</h1>
            <p style={{ fontSize: 16, color: "#4b5563", margin: 0, maxWidth: 650 }}>{profile.headline}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Public Recruiter Portfolio URL:</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
              <a href={getPortfolioUrl()} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", background: "#eff6ff", padding: "6px 12px", borderRadius: 8, textDecoration: "none" }}>
                {getPortfolioUrl()}
              </a>
              <button onClick={copyUrl} className="mint-btn" style={{ fontSize: 12, padding: "6px 14px" }}>
                {copied ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 28, paddingTop: 24, borderTop: "1px solid #f1f5f9" }}>
          <div style={{ cursor: "pointer" }} onClick={() => setActiveTab && setActiveTab("analytics")}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Collaboration Score ↗</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#00A19B" }}>{profile.collaborationScore}%</div>
          </div>
          <div style={{ cursor: "pointer" }} onClick={() => setActiveTab && setActiveTab("progress")}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Merged Pull Requests ↗</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1e293b" }}>{profile.mergedPrs}</div>
          </div>
          <div style={{ cursor: "pointer" }} onClick={() => setActiveTab && setActiveTab("skill_graph")}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Verified Commits ↗</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#1e293b" }}>{profile.commits}</div>
          </div>
        </div>
      </div>

      {/* Evidence Cards Section */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 16 }}>Verified Proof-of-Work Evidence</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {profile.evidenceCards.map((card) => (
            <div key={card.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{card.title}</span>
                <span style={{ fontSize: 12, color: "#059669", background: "#ecfdf5", padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>
                  ✓ {card.type} Verified
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#475569", margin: "0 0 12px 0" }}>{card.summary}</p>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <a href={card.pr} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}>
                  View GitHub Telemetry PR →
                </a>
                <button onClick={() => setSelectedEvidence(card)} className="ghost-btn" style={{ fontSize: 12, padding: "4px 12px" }}>
                  Inspect Evidence Proof
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Project Overview Card */}
      <section>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 16 }}>Verified Project Contributions</h2>
        {profile.projects.map((proj, idx) => (
          <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#111" }}>{proj.title}</h3>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#00A19B", background: "rgba(0,161,155,0.1)", padding: "2px 8px", borderRadius: 8 }}>
                  {proj.badge}
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#64748b", margin: "8px 0 0 0", maxWidth: 600 }}>{proj.summary}</p>
            </div>
            <button onClick={() => setActiveTab && setActiveTab("projects")} className="mint-btn" style={{ fontSize: 13, padding: "10px 20px" }}>
              Explore Project Workspaces →
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}

