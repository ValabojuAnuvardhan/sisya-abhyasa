export default function ProgressTab({ loggedIn, setLoginStep, studentStats = {}, generatedRoadmaps = [], myProjects = [], collaboratorProjects = [] }) {
  if (!loggedIn) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <div className="recoleta" style={{ fontSize: 28, marginBottom: 10 }}>Log in to view your Proof of Work</div>
        <p className="proxima" style={{ color: "#7a6f67", marginBottom: 20 }}>Evidence will be built from real project tasks and authorized GitHub activity.</p>
        <button className="mint-btn" onClick={() => setLoginStep(true)}>Log In</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <div className="recoleta" style={{ fontSize: 40, marginBottom: 8 }}>Proof of Work</div>
        <p className="proxima" style={{ color: "#7a6f67", fontSize: 15 }}>A future evidence-backed view of what {studentStats.name || "you"} actually contributed.</p>
      </div>
      <div className="card" style={{ padding: 28, marginBottom: 20 }}>
        <div className="recoleta" style={{ fontSize: 22, marginBottom: 10 }}>Evidence pipeline not connected yet</div>
        <p className="proxima" style={{ color: "#7a6f67", lineHeight: 1.7 }}>
          Sprint 0 intentionally removed BuildScore, Peer Score, fake badges, and public-profile GitHub scoring. Real evidence will come from the GitHub App, signed webhooks, linked tasks, pull requests, and explainable skill evidence.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div className="stat-box"><div className="recoleta" style={{ fontSize: 30, color: "#00A19B" }}>{myProjects.length}</div><div className="proxima" style={{ fontSize: 12, color: "#9a8f87" }}>My prototype projects</div></div>
        <div className="stat-box"><div className="recoleta" style={{ fontSize: 30, color: "#00A19B" }}>{collaboratorProjects.length}</div><div className="proxima" style={{ fontSize: 12, color: "#9a8f87" }}>Joined prototype projects</div></div>
        <div className="stat-box"><div className="recoleta" style={{ fontSize: 30, color: "#00A19B" }}>{generatedRoadmaps.length}</div><div className="proxima" style={{ fontSize: 12, color: "#9a8f87" }}>Plan previews</div></div>
      </div>
    </div>
  );
}
