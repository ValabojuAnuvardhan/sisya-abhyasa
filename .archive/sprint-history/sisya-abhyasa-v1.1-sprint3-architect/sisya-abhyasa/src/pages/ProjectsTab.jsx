import { useState } from 'react';
import { projects as mockProjects } from '../data/mockData';

export default function ProjectsTab({
  loggedIn,
  setLoginStep,
  studentStats,
  myProjects,
  setMyProjects,
  setCollaboratorProjects,
}) {
  const [showNewModal, setShowNewModal] = useState(false);
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [toast, setToast] = useState(null);

  // New project form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newMax, setNewMax] = useState(4);
  const newSource = "Community";

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleJoin = (proj) => {
    if (!loggedIn) { setLoginStep(true); return; }
    if (joinedIds.has(proj.name)) return;
    setJoinedIds(prev => new Set([...prev, proj.name]));
    setCollaboratorProjects(prev => [...prev, { ...proj, joinedAt: new Date().toISOString() }]);
    showToast(`Joined "${proj.name}" as a collaborator!`);
  };

  const handleCreateProject = () => {
    if (!newName.trim()) return;
    const proj = {
      name: newName.trim(),
      source: newSource,
      description: newDesc.trim(),
      tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
      members: 1,
      maxMembers: newMax,
      progress: 0,
      owner: studentStats.name || "You",
      openRoles: ["Looking for Collaborators"],
      organization: "Student Created",
      createdAt: new Date().toISOString(),
    };
    setMyProjects(prev => [proj, ...prev]);
    showToast(`Project "${proj.name}" created!`);
    setShowNewModal(false);
    setNewName(""); setNewDesc(""); setNewTags(""); setNewMax(4);
  };

  const filteredProjects = mockProjects.filter(p => p.source === "Community");

  const getSourceBadgeStyle = (src) => {
    switch (src) {
      case "Academic": return { background: "rgba(108,127,216,0.12)", color: "#6c7fd8" };
      case "Open Source": return { background: "rgba(196,154,74,0.12)", color: "#c49a4a" };
      case "Company": return { background: "rgba(176,80,80,0.12)", color: "#b05050" };
      default: return { background: "rgba(0,161,155,0.12)", color: "#00A19B" };
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: "#00A19B", color: "#E4DDD3", padding: "12px 24px", borderRadius: 50,
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
          zIndex: 200, boxShadow: "0 8px 24px rgba(0,161,155,0.3)",
          animation: "fadeIn 0.2s ease"
        }}>
          ✓ {toast}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <div className="recoleta" style={{ fontSize: 40, marginBottom: 8 }}>Community Projects</div>
          <p className="proxima" style={{ color: "#7a6f67", fontSize: 15 }}>
            V1.1 discovery: student-created projects that are open to collaborators. Professor, open-source, and company publishing are deferred to V2+.
          </p>
        </div>
        <button className="mint-btn" onClick={() => loggedIn ? setShowNewModal(true) : setLoginStep(true)}>
          + New Project Idea
        </button>
      </div>

      {/* Community / Marketplace Projects */}
      <div className="recoleta" style={{ fontSize: 20, marginBottom: 16, color: "#5a4f47" }}>
        Active Projects ({filteredProjects.length})
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 40 }}>
        {filteredProjects.map((proj, i) => {
          const isJoined = joinedIds.has(proj.name);
          const isFull = proj.members >= proj.maxMembers;
          const badgeStyle = getSourceBadgeStyle(proj.source);
          return (
            <div key={i} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span className="tag" style={badgeStyle}>
                    {proj.source} Project
                  </span>
                  <span className="proxima" style={{ fontSize: 11, color: "#9a8f87" }}>
                    {proj.organization}
                  </span>
                </div>
                <div className="recoleta" style={{ fontSize: 22, marginBottom: 8 }}>{proj.name}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {proj.tags.map(t => <span key={t} className="tag" style={{ background: "rgba(0,161,155,0.1)", color: "#00A19B" }}>{t}</span>)}
                </div>
                <div className="proxima" style={{ fontSize: 12, color: "#9a8f87", marginBottom: 6 }}>
                  👤 {proj.owner} · {proj.members}/{proj.maxMembers} members
                </div>
                {proj.openRoles && (
                  <div style={{ background: "rgba(0,0,0,0.03)", padding: "8px 12px", borderRadius: 8, marginBottom: 14 }}>
                    <div className="proxima" style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#9a8f87", marginBottom: 4 }}>
                      🤝 Complementary Roles Needed:
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {proj.openRoles.map(r => (
                        <span key={r} className="proxima" style={{ fontSize: 11, color: "#4a3f37", fontWeight: 600 }}>• {r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div style={{ marginBottom: 6 }} className="proxima">
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#7a6f67", marginBottom: 6 }}>
                    <span>Progress</span><span>{proj.progress}%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${proj.progress}%` }} /></div>
                </div>
                <button
                  className={isJoined ? "mint-btn" : "ghost-btn"}
                  style={{ marginTop: 16, width: "100%", fontSize: 12, opacity: isFull && !isJoined ? 0.5 : 1 }}
                  onClick={() => !isJoined && !isFull && handleJoin(proj)}
                  disabled={isFull && !isJoined}
                >
                  {isJoined ? "✓ Joined as Collaborator" : isFull ? "Project Full" : "Apply to Team"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* My Projects */}
      {myProjects.length > 0 && (
        <>
          <div className="recoleta" style={{ fontSize: 20, marginBottom: 16, color: "#5a4f47" }}>My Projects</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {myProjects.map((proj, i) => (
              <div key={i} className="card" style={{ padding: 24, borderColor: "rgba(0,161,155,0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div className="recoleta" style={{ fontSize: 22 }}>{proj.name}</div>
                  <span className="tag" style={{ background: "rgba(0,161,155,0.12)", color: "#00A19B" }}>My Idea</span>
                </div>
                {proj.description && (
                  <p className="proxima" style={{ fontSize: 13, color: "#7a6f67", marginBottom: 12, lineHeight: 1.5 }}>{proj.description}</p>
                )}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                  {proj.tags.map(t => <span key={t} className="tag" style={{ background: "rgba(0,161,155,0.1)", color: "#00A19B" }}>{t}</span>)}
                </div>
                <div className="proxima" style={{ fontSize: 12, color: "#9a8f87", marginBottom: 8 }}>
                  👤 You · 1/{proj.maxMembers} members
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${proj.progress}%` }} /></div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* New Project Modal */}
      {showNewModal && (
        <div className="overlay" onClick={() => setShowNewModal(false)}>
          <div className="login-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="recoleta" style={{ fontSize: 24, marginBottom: 6 }}>Start a New Project 🚀</div>
            <p className="proxima" style={{ fontSize: 13, color: "#7a6f67", marginBottom: 24 }}>
              Describe your idea and invite collaborators.
            </p>

            <label className="proxima" style={{ fontSize: 12, fontWeight: 600, color: "#5a4f47", display: "block", marginBottom: 6 }}>Project Name *</label>
            <input className="input" placeholder="e.g. EduBot AI" value={newName} onChange={e => setNewName(e.target.value)} style={{ marginBottom: 14 }} />

            <label className="proxima" style={{ fontSize: 12, fontWeight: 600, color: "#5a4f47", display: "block", marginBottom: 6 }}>Description</label>
            <textarea
              className="input"
              placeholder="What problem does it solve?"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              rows={3}
              style={{ marginBottom: 14, resize: "vertical" }}
            />

            <label className="proxima" style={{ fontSize: 12, fontWeight: 600, color: "#5a4f47", display: "block", marginBottom: 6 }}>Tech Tags (comma-separated)</label>
            <input className="input" placeholder="e.g. React, Python, ML" value={newTags} onChange={e => setNewTags(e.target.value)} style={{ marginBottom: 14 }} />

            <label className="proxima" style={{ fontSize: 12, fontWeight: 600, color: "#5a4f47", display: "block", marginBottom: 6 }}>Max Team Size</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {[2, 3, 4, 5, 6].map(n => (
                <button key={n} onClick={() => setNewMax(n)}
                  className={newMax === n ? "mint-btn" : "ghost-btn"}
                  style={{ fontSize: 13, padding: "6px 14px" }}>
                  {n}
                </button>
              ))}
            </div>

            <button className="mint-btn" style={{ width: "100%", padding: "13px", fontSize: 14, opacity: !newName.trim() ? 0.5 : 1 }}
              onClick={handleCreateProject} disabled={!newName.trim()}>
              Create Project →
            </button>
            <button className="proxima" style={{ background: "none", border: "none", color: "#9a8f87", fontSize: 12, cursor: "pointer", marginTop: 12, display: "block", width: "100%", textAlign: "center" }}
              onClick={() => setShowNewModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
