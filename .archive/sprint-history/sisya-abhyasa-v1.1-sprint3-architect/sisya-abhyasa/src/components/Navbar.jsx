export default function Navbar({ activeTab, setActiveTab, tabs, loggedIn, setLoginStep, studentStats }) {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(228,221,211,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "0 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "#00A19B", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#E4DDD3", fontSize: 16 }}>⬡</span>
          </div>
          <span className="recoleta" style={{ fontSize: 22, color: "#1a1410", letterSpacing: "-0.02em" }}>Śiṣya Abhyāsa</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} className={`nav-tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {loggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="avatar">{studentStats.avatar}</div>
              <div>
                <span className="proxima" style={{ fontSize: 13, fontWeight: 600, color: "#1a1410", display: "block" }}>
                  {studentStats.name}
                </span>
                <span className="proxima" style={{ fontSize: 11, color: "#7a6f67" }}>
                  {studentStats.year || "Student builder"}
                </span>
              </div>
            </div>
          ) : (
            <>
              <button data-testid="login-btn" className="ghost-btn" onClick={() => setLoginStep(true)}>Log In</button>
              <button className="mint-btn" onClick={() => setLoginStep(true)}>Sign Up Free</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
