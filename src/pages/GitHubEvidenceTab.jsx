import { useState } from "react";

export default function GitHubEvidenceTab({ studentStats }) {
  const [activeTab, setActiveTab] = useState("timeline");
  const [synced, setSynced] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);
  const [connectInput, setConnectInput] = useState("");
  const [userGithub, setUserGithub] = useState(() => studentStats?.githubUsername || "");

  const studentName = studentStats?.name || "Student Builder";

  const handleConnectGithub = (e) => {
    if (e) e.preventDefault();
    const handle = connectInput.trim().replace(/^@/, "");
    if (!handle) return;
    setUserGithub(handle);
    if (studentStats) {
      studentStats.githubUsername = handle;
      try {
        localStorage.setItem("sisya_user_session", JSON.stringify(studentStats));
      } catch (err) {
        console.warn(err);
      }
    }
  };

  if (!userGithub) {
    return (
      <div style={{ maxWidth: 640, margin: "40px auto", background: "#ffffff", borderRadius: 16, padding: "48px 36px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🐱</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>No GitHub Account Connected</h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.6 }}>
          Hello <strong>{studentName}</strong>! You haven't connected your GitHub username yet. Connect your handle below to start capturing verified pull requests, code diffs, and HMAC webhook signatures.
        </p>
        <form onSubmit={handleConnectGithub} style={{ display: "flex", gap: 10, maxWidth: 400, margin: "0 auto" }}>
          <input
            type="text"
            placeholder="e.g. rahul-sharma-dev"
            value={connectInput}
            onChange={(e) => setConnectInput(e.target.value)}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button type="submit" className="mint-btn" style={{ padding: "10px 20px", fontSize: 13, fontWeight: 700 }}>
            Connect Handle →
          </button>
        </form>
      </div>
    );
  }

  const username = userGithub;

  const pullRequests = [
    {
      id: "PR #12",
      title: "Authentication & OAuth Setup",
      author: username,
      time: "3 days ago",
      status: "Verified",
      isMerged: true,
      diff: "+142 lines, -18 lines",
      prUrl: "https://github.com/ValabojuAnuvardhan/sisya-abhyasa",
      hmac: "sha256-a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0"
    },
    {
      id: "PR #18",
      title: "Dashboard Telemetry Integration",
      author: username,
      time: "5 days ago",
      status: "Verified",
      isMerged: true,
      diff: "+320 lines, -45 lines",
      prUrl: "https://github.com/ValabojuAnuvardhan/sisya-abhyasa",
      hmac: "sha256-9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba"
    },
    {
      id: "PR #21",
      title: "Kanban Task Pipeline",
      author: username,
      time: "1 day ago",
      status: "Pending Review",
      isMerged: false,
      diff: "+95 lines, -2 lines",
      prUrl: "https://github.com/ValabojuAnuvardhan/sisya-abhyasa",
      hmac: "sha256-11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff"
    },
    {
      id: "PR #26",
      title: "Task AI Mentor Integration",
      author: username,
      time: "6 days ago",
      status: "Verified",
      isMerged: true,
      diff: "+410 lines, -60 lines",
      prUrl: "https://github.com/ValabojuAnuvardhan/sisya-abhyasa",
      hmac: "sha256-ffeeddccbbaa00998877665544332211ffeeddccbbaa00998877665544332211"
    }
  ];

  const handleSync = () => {
    setSynced(true);
    setTimeout(() => setSynced(false), 2500);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 0" }}>
      {/* PR Details Modal */}
      {selectedPR && (
        <div className="overlay">
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span className={selectedPR.isMerged ? "badge-verified" : "badge-pending"}>
                {selectedPR.status}
              </span>
              <button onClick={() => setSelectedPR(null)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>{selectedPR.id}: {selectedPR.title}</h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0" }}>{selectedPR.isMerged ? "Merged" : "Opened"} by {selectedPR.author} · {selectedPR.time}</p>

            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, border: "1px solid #e2e8f0", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>HMAC Webhook Telemetry Signature</div>
              <code style={{ fontSize: 11, color: "#0f172a", wordBreak: "break-all" }}>{selectedPR.hmac}</code>
              <div style={{ fontSize: 13, color: "#00a19b", fontWeight: 600, marginTop: 12 }}>Code Diff: {selectedPR.diff}</div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setSelectedPR(null)} className="ghost-btn">Close</button>
              <a href={selectedPR.prUrl} target="_blank" rel="noreferrer" className="mint-btn" style={{ textDecoration: "none" }}>
                View on GitHub ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Header Breadcrumb */}
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
        Projects › Student Task Manager › <strong>GitHub Evidence</strong>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              🛡️
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>GitHub Evidence</h1>
          </div>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 4, margin: 0 }}>
            Track contributions and verified pull requests for <strong>{studentName}</strong> (<code>@{username}</code>).
          </p>
        </div>
      </div>

      {/* GitHub Connected Card */}
      <div className="card" style={{ padding: "20px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#10b981", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800 }}>
            ✓
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>GitHub Connected</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", marginTop: 4 }}>
              <span>🐱</span>
              <span>Connected as <strong>@{username}</strong></span>
            </div>
          </div>
        </div>
        <button className="danger-btn">Disconnect</button>
      </div>

      {/* Repository Card */}
      <div className="card" style={{ padding: "24px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Repository</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Student Task Manager</h2>
              <span className="badge-public">Public</span>
            </div>
            <a href={`https://github.com/${username}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600, marginTop: 6, display: "inline-block" }}>
              github.com/{username}/student-task-manager ↗
            </a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>Default Branch</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>main</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>Last Synced</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
                {synced ? "Just now" : "2 hours ago"}
              </div>
            </div>
            <button onClick={handleSync} className="ghost-btn" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>🔄</span> {synced ? "Syncing..." : "Sync Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid (Left Feed ~70%, Right Sidebar ~30%) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        
        {/* Left Column: Evidence Tabs & Timeline Feed */}
        <div className="card" style={{ padding: "24px" }}>
          {/* Sub Tabs */}
          <div style={{ display: "flex", gap: 24, borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 20 }}>
            {[
              { id: "timeline", label: "Evidence Timeline" },
              { id: "prs", label: "Pull Requests" },
              { id: "commits", label: "Commits" },
              { id: "branches", label: "Branches" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 14,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? "#00a19b" : "#64748b",
                  cursor: "pointer",
                  paddingBottom: 8,
                  borderBottom: activeTab === tab.id ? "2px solid #00a19b" : "2px solid transparent",
                  marginBottom: -13,
                  transition: "all 0.15s ease"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Timeline Feed List */}
          <div>
            {pullRequests.map((pr) => (
              <div key={pr.id} className="timeline-item">
                <div className="timeline-icon" style={{ background: pr.isMerged ? "#ecfdf5" : "#fffbe6", color: pr.isMerged ? "#059669" : "#d97706" }}>
                  {pr.isMerged ? "✓" : "🕒"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>{pr.id}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "2px 0 4px 0" }}>{pr.title}</div>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    {pr.isMerged ? "Merged" : "Opened"} by {pr.author} · {pr.time}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className={pr.isMerged ? "badge-verified" : "badge-pending"}>
                    {pr.status}
                  </span>
                  <button onClick={() => setSelectedPR(pr)} className="ghost-btn" style={{ padding: "5px 12px", fontSize: 12 }}>
                    View PR ↗
                  </button>
                  <button style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#94a3b8" }}>
                    ···
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
            <a href="https://github.com/ValabojuAnuvardhan/sisya-abhyasa/pulls" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
              View all pull requests →
            </a>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Repository Summary Card */}
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Repository Summary</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🔀</span> Total Pull Requests
                </span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>24</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>✓</span> Merged
                </span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>16</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🕒</span> Open
                </span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>8</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>💻</span> Commits
                </span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>142</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>👥</span> Contributors
                </span>
                <span style={{ fontWeight: 700, color: "#0f172a" }}>5</span>
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
              <a href="https://github.com/ValabojuAnuvardhan/sisya-abhyasa" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
                View repository →
              </a>
            </div>
          </div>

          {/* Skills Earned Card */}
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Skills Earned</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { name: "FastAPI", icon: "⚡", percent: 92, level: "Expert" },
                { name: "Next.js", icon: "N", percent: 82, level: "Advanced" },
                { name: "PostgreSQL", icon: "🐘", percent: 80, level: "Advanced" },
                { name: "Git", icon: "🔀", percent: 85, level: "Advanced" },
                { name: "Docker", icon: "🐳", percent: 65, level: "Intermediate" },
              ].map(skill => (
                <div key={skill.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      <span style={{ fontSize: 14 }}>{skill.icon}</span>
                      <span>{skill.name}</span>
                    </div>
                    <span className="badge-public">{skill.level}</span>
                  </div>
                  <div className="skill-progress-bg">
                    <div className="skill-progress-fill" style={{ width: `${skill.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 14, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
              <a href="#skill_graph" style={{ fontSize: 13, color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
                View all skills →
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
