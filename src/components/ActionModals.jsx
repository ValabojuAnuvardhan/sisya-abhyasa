import { useState } from "react";

export function NewActionModal({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("project");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, category, description });
    onClose();
  };

  return (
    <div className="overlay">
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>Create New Item</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" }}
            >
              <option value="project">New Collaborative Project</option>
              <option value="task">New Task / Milestone</option>
              <option value="evidence">Manual Evidence Card</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Title</label>
            <input
              type="text"
              placeholder="e.g. EcoSmart Satellite Ingestion Engine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Description / Goal</label>
            <textarea
              rows={3}
              placeholder="Brief summary of project scope, tech stack, and goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, outline: "none", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
            <button type="button" onClick={onClose} className="ghost-btn">Cancel</button>
            <button type="submit" className="mint-btn">Create Item →</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function NotificationsDrawer({ onClose }) {
  const notifications = [
    { id: 1, title: "PR #26 Merged", text: "Task AI Mentor Integration verified by HMAC telemetry signature.", time: "10m ago", icon: "✓", unread: true },
    { id: 2, title: "New Join Request", text: "Priya requested to join EcoSmart Ocean Plastic Tracking.", time: "1h ago", icon: "👤", unread: true },
    { id: 3, title: "Skill Badge Unlocked", text: "FastAPI proficiency score upgraded to Expert (92%).", time: "2h ago", icon: "⚡", unread: true },
  ];

  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 460 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🔔</span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>Notifications</h2>
            <span style={{ fontSize: 11, background: "#ef4444", color: "#fff", padding: "2px 8px", borderRadius: 10, fontWeight: 800 }}>3 New</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#64748b" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {notifications.map((n) => (
            <div key={n.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#e6f7f5", color: "#00a19b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {n.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{n.title}</div>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{n.time}</span>
                </div>
                <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0 0" }}>{n.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button onClick={onClose} className="mint-btn" style={{ width: "100%" }}>Dismiss All Notifications</button>
        </div>
      </div>
    </div>
  );
}

export function RewardsModal({ onClose }) {
  return (
    <div className="overlay">
      <div className="modal" style={{ maxWidth: 500, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Proof of Work Rewards</h2>
        <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20 }}>
          Earn verifiable credentials and telemetry badges as you complete tasks and merge pull requests.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🏆</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Telemetry Master</div>
            <div style={{ fontSize: 12, color: "#059669", fontWeight: 600, marginTop: 4 }}>✓ Verified HMAC</div>
          </div>

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>⚡</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>FastAPI Specialist</div>
            <div style={{ fontSize: 12, color: "#059669", fontWeight: 600, marginTop: 4 }}>✓ 92% Proficiency</div>
          </div>
        </div>

        <button onClick={onClose} className="mint-btn" style={{ padding: "10px 28px" }}>Great!</button>
      </div>
    </div>
  );
}
