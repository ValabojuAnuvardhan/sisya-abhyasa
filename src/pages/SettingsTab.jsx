import { useState } from "react";

export default function SettingsTab({ studentStats }) {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: studentStats?.name || "Student Builder",
    username: studentStats?.githubUsername || "",
    email: studentStats?.email || "student@sisya-abhyasa.io",
    bio: `${studentStats?.targetCareer || "Full Stack Software Engineer"} | React, FastAPI & Cloud Systems`,
    githubRepo: studentStats?.githubUsername ? `https://github.com/${studentStats.githubUsername}` : "https://github.com/sisya-abhyasa",
    autoSync: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>Account & Telemetry Settings</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Manage identity, GitHub webhook integrations, and telemetry preferences.</p>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>GitHub Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Headline / Bio</label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Primary GitHub Repository</label>
            <input
              type="text"
              value={formData.githubRepo}
              onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14 }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
            <button type="submit" className="mint-btn" style={{ padding: "10px 24px" }}>
              {saved ? "✓ Settings Saved!" : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
