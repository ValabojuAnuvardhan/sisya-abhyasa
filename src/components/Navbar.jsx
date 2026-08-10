export default function Navbar({ setLoginStep, studentStats }) {
  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "#ffffff",
      borderBottom: "1px solid #e2e8f0",
      height: 64,
      padding: "0 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      {/* Left Logo Section */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>
          ☰
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "#0f172a",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 800
          }}>
            ⚙️
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
            Śiṣya Abhyāsa
          </span>
        </div>
      </div>

      {/* Right Controls Section */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Search Input */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "6px 12px",
          width: 240,
        }}>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>🔍</span>
          <input
            type="text"
            placeholder="Type / to search"
            style={{
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: 13,
              color: "#0f172a",
              width: "100%",
            }}
          />
          <span style={{ fontSize: 11, color: "#94a3b8", background: "#ffffff", border: "1px solid #e2e8f0", padding: "1px 5px", borderRadius: 4 }}>
            ✕
          </span>
        </div>

        {/* Action Buttons */}
        <button className="ghost-btn" style={{
          borderColor: "#00a19b",
          color: "#00a19b",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 8
        }}>
          <span>+</span> New
        </button>

        {/* Icon Buttons */}
        <button style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#64748b", padding: 4 }}>
          🎁
        </button>

        <div style={{ position: "relative" }}>
          <button style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#64748b", padding: 4 }}>
            🔔
          </button>
          <span style={{
            position: "absolute",
            top: -2,
            right: -2,
            background: "#ef4444",
            color: "#ffffff",
            fontSize: 9,
            fontWeight: 800,
            width: 15,
            height: 15,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            3
          </span>
        </div>

        {/* User Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setLoginStep(true)}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
            alt="User Avatar"
            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "1px solid #e2e8f0" }}
          />
        </div>
      </div>
    </header>
  );
}

