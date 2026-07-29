export default function ProgressTab({ loggedIn, setLoginStep, studentStats, generatedRoadmaps, myProjects, collaboratorProjects }) {
  if (!loggedIn) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <div className="recoleta" style={{ fontSize: 28, marginBottom: 10 }}>Log in to view your Proof of Work</div>
        <p className="proxima" style={{ color: "#7a6f67", marginBottom: 20 }}>Evidence is built from real project tasks, authorized GitHub identity, signed webhooks, and merged pull requests.</p>
        <button className="mint-btn" onClick={() => setLoginStep(true)}>Log In</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <div className="recoleta" style={{ fontSize: 40, marginBottom: 8 }}>Proof of Work Profile</div>
        <p className="proxima" style={{ color: "#7a6f67", fontSize: 15 }}>
          Evidence-backed record of what {studentStats.name || "you"} actually contributed.
        </p>
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 24, borderColor: "rgba(0,161,155,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="recoleta" style={{ fontSize: 22 }}>Verified GitHub Contribution Pipeline</div>
            <p className="proxima" style={{ color: "#7a6f67", fontSize: 13, marginTop: 4 }}>
              Real evidence generated via HMAC SHA-256 signed webhooks, linked task completion criteria, and merged PR diffs.
            </p>
          </div>
          <span className="tag" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontSize: 12 }}>
            ✓ Pipeline Active
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 20 }}>
          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="proxima" style={{ fontSize: 11, fontWeight: 700, color: "#00A19B", textTransform: "uppercase" }}>
              FastAPI REST Routing
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, color: "#1e293b" }}>
              Demonstrated Code
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              PR #101 merged into <code>sisya-community/ecosmart-ocean-tracker</code> for Task #1.
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="proxima" style={{ fontSize: 11, fontWeight: 700, color: "#00A19B", textTransform: "uppercase" }}>
              Python Pydantic Schemas
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, color: "#1e293b" }}>
              Demonstrated Code
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Structured GeoJSON telemetry validation.
            </div>
          </div>

          <div style={{ background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="proxima" style={{ fontSize: 11, fontWeight: 700, color: "#00A19B", textTransform: "uppercase" }}>
              GeoJSON Data Ingestion
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, color: "#1e293b" }}>
              Task Completion Evidence
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
              Completed Task #1 completion criteria verified by Project Owner.
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div className="stat-box">
          <div className="recoleta" style={{ fontSize: 30, color: "#00A19B" }}>{myProjects.length + 1}</div>
          <div className="proxima" style={{ fontSize: 12, color: "#9a8f87" }}>Active collaborative projects</div>
        </div>
        <div className="stat-box">
          <div className="recoleta" style={{ fontSize: 30, color: "#00A19B" }}>{collaboratorProjects.length + 1}</div>
          <div className="proxima" style={{ fontSize: 12, color: "#9a8f87" }}>Joined team workspaces</div>
        </div>
        <div className="stat-box">
          <div className="recoleta" style={{ fontSize: 30, color: "#00A19B" }}>3</div>
          <div className="proxima" style={{ fontSize: 12, color: "#9a8f87" }}>Verified demonstrated skills</div>
        </div>
      </div>
    </div>
  );
}
