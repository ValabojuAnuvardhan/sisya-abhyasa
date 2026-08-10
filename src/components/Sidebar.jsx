export default function Sidebar({ activeTab, setActiveTab, loggedIn, setLoginStep }) {
  const publicMainNav = [
    { id: "home", label: "Dashboard", icon: "🏠" },
    { id: "solutions", label: "Community", icon: "👥" },
  ];

  const authenticatedMainNav = [
    { id: "home", label: "Dashboard", icon: "🏠" },
    { id: "projects", label: "Projects", icon: "📁" },
    { id: "solutions", label: "Community", icon: "👥" },
    { id: "github", label: "GitHub Evidence", icon: "🛡️" },
    { id: "progress", label: "Proof of Work", icon: "🏆" },
    { id: "skill_graph", label: "Skills", icon: "📊" },
  ];

  const workspaceNav = [
    { id: "kanban", label: "Kanban Tasks", icon: "📋" },
    { id: "analytics", label: "Team Analytics", icon: "📊" },
    { id: "recruiter", label: "Recruiter Portfolio", icon: "💼" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const mainNav = loggedIn ? authenticatedMainNav : publicMainNav;

  return (
    <aside style={{
      width: 240,
      background: "#ffffff",
      borderRight: "1px solid #e2e8f0",
      position: "sticky",
      top: 64,
      height: "calc(100vh - 64px)",
      overflowY: "auto",
      padding: "16px 12px",
      flexShrink: 0,
    }}>
      <div className="sidebar-label">MAIN</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {mainNav.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {loggedIn ? (
        <>
          <div className="sidebar-label" style={{ marginTop: 24 }}>WORKSPACE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {workspaceNav.map((item) => (
              <button
                key={item.id}
                className={`sidebar-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={{
          marginTop: 24,
          padding: "16px 14px",
          borderRadius: 12,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          textAlign: "center"
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🔒</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Workspace Locked</div>
          <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 12px 0", lineHeight: 1.4 }}>
            Sign in to unlock tasks, GitHub evidence & skill graph.
          </p>
          <button
            onClick={() => setLoginStep && setLoginStep(true)}
            className="mint-btn"
            style={{ width: "100%", padding: "7px 12px", fontSize: 12, fontWeight: 700 }}
          >
            Sign In
          </button>
        </div>
      )}
    </aside>
  );
}
