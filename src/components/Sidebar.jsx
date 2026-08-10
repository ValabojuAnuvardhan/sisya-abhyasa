export default function Sidebar({ activeTab, setActiveTab }) {
  const mainNav = [
    { id: "home", label: "Dashboard", icon: "🏠" },
    { id: "projects", label: "Projects", icon: "📁" },
    { id: "solutions", label: "Community", icon: "👥" },
    { id: "github", label: "GitHub Evidence", icon: "🛡️" },
    { id: "progress", label: "Proof of Work", icon: "🏆" },
    { id: "skill_graph", label: "Skills", icon: "📊" },
  ];

  const workspaceNav = [
    { id: "overview", label: "Overview", icon: "🎛️" },
    { id: "kanban", label: "Kanban Tasks", icon: "📋" },
    { id: "analytics", label: "Team Space & Chat", icon: "💬" },
    { id: "milestones", label: "Milestones", icon: "🚩" },
    { id: "recruiter", label: "Team Members", icon: "👥" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

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
    </aside>
  );
}
