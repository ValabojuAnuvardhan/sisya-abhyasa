import { useState } from "react";
import { projects as _initialMockProjects } from "../data/mockData";

function cleanStudentName(nameStr) {
  if (!nameStr) return "Project Lead";
  let cleaned = nameStr.trim();
  cleaned = cleaned.replace(/^([a-z0-9_-]+)([A-Z][a-z]+.*)$/, "$2");
  return cleaned.trim() || "Project Lead";
}

export default function ProjectsTab({
  loggedIn,
  setLoginStep,
  studentStats,
  myProjects,
  setMyProjects,
  setCollaboratorProjects,
}) {
  const rawLeadName = studentStats?.name || "Project Lead";
  const leadName = cleanStudentName(rawLeadName);
  const leadGithub = studentStats?.githubUsername ? `@${studentStats.githubUsername}` : "@project-lead";

  // Current active role simulator: 'studentA' (Owner) or 'studentB' (Collaborator)
  const [activeRole, setActiveRole] = useState("studentA");

  // Project state for the primary collaborative project
  const [projectState, setProjectState] = useState({
    id: "proj-ecosmart-101",
    name: "EcoSmart Ocean Plastic Tracking",
    owner: `${leadName} (Project Lead)`,
    organization: "Student Created",
    source: "Community",
    description: "Build real-time satellite & GIS sensor tracking for ocean plastic accumulation zones.",
    collaborationPitch: "Looking for backend & GIS enthusiasts to build live FastAPI GeoJSON endpoints and map layers.",
    skillsNeeded: ["React", "FastAPI", "Python", "GeoJSON"],
    teamCapacity: 4,
    discoverable: true,
    progress: 35,
    members: [
      { id: "user-a", name: `${leadName} (Project Lead)`, role: "Owner", github: leadGithub },
    ],
    joinRequests: [
      {
        id: "req-b-01",
        userId: "user-b",
        userName: "Priya (Team Member)",
        userAvatar: "P",
        userSkills: ["React", "Python", "GIS"],
        userTargetRole: "Full Stack Developer",
        message: `Hi ${leadName.split(" ")[0]}! I have experience with Python and GIS, and I'd love to learn FastAPI by building Task #1.`,
        status: "pending", // pending | accepted | rejected
        createdAt: "Just now",
      },
    ],
    tasks: [
      {
        id: "task-1",
        number: 1,
        title: "Ingest Sensor GeoJSON Stream",
        description: "Implement FastAPI REST endpoint to receive marine sensor telemetry and stream GeoJSON points over WebSockets.",
        completionCriteria: "Endpoint accepts GeoJSON FeatureCollections, validates lat/lon coordinates, and broadcasts payload to active clients.",
        requiredSkills: ["FastAPI", "Python", "GeoJSON"],
        resources: "https://fastapi.tiangolo.com/tutorial/body/ | https://geojson.org/",
        assignedTo: null, // null or 'user-b'
        status: "todo", // todo | in_progress | pr_submitted | completed
        linkedPR: null,
      },
      {
        id: "task-2",
        number: 2,
        title: "Interactive Heatmap Map Layer",
        description: "Create an OpenLayers map component displaying live plastic density heatmaps.",
        completionCriteria: "Renders smooth heatmap layer fed by WebSocket telemetry with density color gradients.",
        requiredSkills: ["React", "OpenLayers"],
        resources: "https://openlayers.org/en/latest/doc/",
        assignedTo: null,
        status: "todo",
        linkedPR: null,
      },
    ],
    teamSpace: {
      meetingUrl: "https://meet.google.com/new",
      messages: [
        {
          id: "msg-1",
          author: `${leadName} (Project Lead)`,
          text: "Welcome team! Check out #task-1 for the sensor ingestion API.",
          time: "10:15 AM",
          references: ["#task-1"],
        },
      ],
    },
    github: {
      repoName: "sisya-community/ecosmart-ocean-tracker",
      connected: true,
      studentBConnected: false, // Priya's GitHub authorization
      studentBUsername: "@priya-code",
      webhooks: [],
      prs: [],
      skillEvidence: [],
    },
  });

  const [activeWorkspaceSubTab, setActiveWorkspaceSubTab] = useState("tasks"); // tasks | teamspace | github | proof
  const [toast, setToast] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);
  const [prSubmitting, setPrSubmitting] = useState(false);
  const [webhookSimulated, setWebhookSimulated] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- Handlers for Student A (Project Owner) ---
  const handleToggleDiscoverable = () => {
    setProjectState((prev) => ({
      ...prev,
      discoverable: !prev.discoverable,
    }));
    showToast(
      !projectState.discoverable
        ? "Project is now DISCOVERABLE on the Community Marketplace!"
        : "Project is now UNPUBLISHED (private)."
    );
  };

  const handleDecideRequest = (requestId, decision) => {
    setProjectState((prev) => {
      const updatedReqs = prev.joinRequests.map((r) =>
        r.id === requestId ? { ...r, status: decision } : r
      );
      let updatedMembers = [...prev.members];
      if (decision === "accepted") {
        const req = prev.joinRequests.find((r) => r.id === requestId);
        if (req && !updatedMembers.some((m) => m.id === req.userId)) {
          updatedMembers.push({
            id: req.userId,
            name: req.userName,
            role: "Contributor",
            github: "@priya-code",
          });
        }
      }
      return {
        ...prev,
        joinRequests: updatedReqs,
        members: updatedMembers,
      };
    });
    showToast(
      decision === "accepted"
        ? "Accepted Priya! She is now a project Contributor."
        : "Rejected join request."
    );
  };

  const handleAssignTask = (taskId, userId) => {
    setProjectState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, assignedTo: userId } : t)),
    }));
    showToast("Task #1 assigned to Priya!");
  };

  // --- Handlers for Student B (Collaborator / Candidate) ---
  const handleSendJoinRequest = () => {
    setProjectState((prev) => ({
      ...prev,
      joinRequests: prev.joinRequests.map((r) =>
        r.userId === "user-b" ? { ...r, status: "pending" } : r
      ),
    }));
    showToast(`Join request submitted to ${leadName}!`);
  };

  const handleConnectGithub = () => {
    setProjectState((prev) => ({
      ...prev,
      github: { ...prev.github, studentBConnected: true },
    }));
    showToast("GitHub identity authorized: @priya-code linked to Śiṣya account!");
  };

  // --- Team Space Chat & @mentor Handler ---
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    const isStudentA = activeRole === "studentA";
    const authorName = isStudentA ? `${leadName} (Project Lead)` : "Priya (Team Member)";
    const newMsg = {
      id: `msg-${Date.now()}`,
      author: authorName,
      text,
      time: "Just now",
      references: text.includes("#task-1") ? ["#task-1"] : [],
    };

    setProjectState((prev) => ({
      ...prev,
      teamSpace: {
        ...prev.teamSpace,
        messages: [...prev.teamSpace.messages, newMsg],
      },
    }));

    setChatInput("");

    // Trigger @mentor auto response if prompt includes @mentor
    if (text.toLowerCase().includes("@mentor")) {
      setMentorLoading(true);
      setTimeout(() => {
        const mentorMsg = {
          id: `msg-mentor-${Date.now()}`,
          author: "Śiṣya AI Mentor",
          isMentor: true,
          text: `Hi ${authorName.split(" ")[0]}! For GeoJSON validation in FastAPI, define a Pydantic schema using GeoJSON types or validate the 'type': 'FeatureCollection' payload dict with lat/lon float bounds. Check the FastAPI documentation resources linked in Task #1!`,
          time: "Just now",
          references: ["#task-1"],
        };
        setProjectState((prev) => ({
          ...prev,
          teamSpace: {
            ...prev.teamSpace,
            messages: [...prev.teamSpace.messages, mentorMsg],
          },
        }));
        setMentorLoading(false);
      }, 1200);
    }
  };

  // --- Webhook & GitHub Pipeline Simulator ---
  const handleSimulatePRSubmission = () => {
    setPrSubmitting(true);
    setTimeout(() => {
      const prObj = {
        id: "pr-101",
        number: 101,
        title: "feat: add GeoJSON ingestion endpoint #task-1",
        author: "@priya-code",
        taskId: "task-1",
        state: "open",
        merged: false,
        diffSummary: "+142 lines: app/api/sensor.py, app/schemas/geojson.py",
        webhooks: [
          { event: "pull_request.opened", delivery: "del-883921", verified: true, time: "Just now" },
        ],
      };
      setProjectState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === "task-1" ? { ...t, status: "pr_submitted", linkedPR: "#101" } : t)),
        github: {
          ...prev.github,
          prs: [prObj, ...prev.github.prs],
          webhooks: [...prObj.webhooks, ...prev.github.webhooks],
        },
      }));
      setPrSubmitting(false);
      setWebhookSimulated(true);
      showToast("PR #101 opened! Śiṣya received signed GitHub webhook & linked to Task #1.");
    }, 1000);
  };

  const handleSimulatePRMerge = () => {
    setProjectState((prev) => {
      const updatedPRs = prev.github.prs.map((pr) =>
        pr.number === 101 ? { ...pr, state: "closed", merged: true } : pr
      );
      const mergeWebhook = {
        event: "pull_request.closed (merged=true)",
        delivery: "del-883999",
        verified: true,
        time: "Just now",
      };
      const skillEvidenceItems = [
        {
          id: "ev-1",
          skill: "FastAPI",
          kind: "Demonstrated Code",
          explanation: "Implemented validated REST route receiving sensor payload stream.",
        },
        {
          id: "ev-2",
          skill: "Python",
          kind: "Demonstrated Code",
          explanation: "Wrote structured Pydantic schemas for GeoJSON feature processing.",
        },
        {
          id: "ev-3",
          skill: "GeoJSON Telemetry",
          kind: "Task Completion",
          explanation: "Completed Task #1 criteria with verified PR #101 merge.",
        },
      ];
      return {
        ...prev,
        progress: 65,
        tasks: prev.tasks.map((t) => (t.id === "task-1" ? { ...t, status: "completed" } : t)),
        github: {
          ...prev.github,
          prs: updatedPRs,
          webhooks: [mergeWebhook, ...prev.github.webhooks],
          skillEvidence: skillEvidenceItems,
        },
      };
    });
    showToast("Student A merged PR #101! Trusted Contribution & Demonstrated Skill Evidence recorded for Student B.");
  };

  const isStudentA = activeRole === "studentA";
  const priyaMember = projectState.members.find((m) => m.id === "user-b");
  const priyaRequest = projectState.joinRequests.find((r) => r.userId === "user-b");

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#00A19B",
            color: "#E4DDD3",
            padding: "12px 24px",
            borderRadius: 50,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            zIndex: 300,
            boxShadow: "0 8px 24px rgba(0,161,155,0.4)",
            animation: "fadeIn 0.2s ease",
          }}
        >
          ✓ {toast}
        </div>
      )}



      {/* Main Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
        <div>
          <div className="recoleta" style={{ fontSize: 36, marginBottom: 8 }}>
            Community Projects
          </div>
          <p className="proxima" style={{ color: "#7a6f67", fontSize: 14 }}>
            Connect discovery to real team authorization, task execution, and verified GitHub Proof-of-Work.
          </p>
        </div>
      </div>

      {/* STUDENT B: DISCOVERY MARKETPLACE VIEW (when NOT yet an accepted member and viewing Marketplace) */}
      {!isStudentA && priyaRequest?.status !== "accepted" && (
        <div style={{ marginBottom: 40 }}>
          <div className="recoleta" style={{ fontSize: 22, marginBottom: 16, color: "#4a3f37" }}>
            🔍 Community Marketplace (Student B View)
          </div>

          <div className="card" style={{ padding: 28, borderColor: "rgba(0,161,155,0.3)", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <span className="tag" style={{ background: "rgba(0,161,155,0.12)", color: "#00A19B", marginRight: 8 }}>
                  Student Collaborative Project
                </span>
                <span className="tag" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                  Discoverable (Open)
                </span>
                <div className="recoleta" style={{ fontSize: 24, marginTop: 10 }}>{projectState.name}</div>
                <div className="proxima" style={{ fontSize: 12, color: "#9a8f87", marginTop: 4 }}>
                  Owner: 👤 {projectState.owner} · Capacity: {projectState.members.length}/{projectState.teamCapacity} members
                </div>
              </div>
            </div>

            <p className="proxima" style={{ fontSize: 14, color: "#5a4f47", lineHeight: 1.6, marginBottom: 16 }}>
              {projectState.collaborationPitch}
            </p>

            {/* Match Explanation Box */}
            <div
              style={{
                background: "rgba(0,161,155,0.05)",
                border: "1px solid rgba(0,161,155,0.2)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <div className="proxima" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#00A19B", marginBottom: 8 }}>
                ✨ Transparent Match Explanation for Priya
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div style={{ fontSize: 12, color: "#2e7d32" }}>
                  <strong>✓ Existing Skills:</strong> Python, React, GIS
                </div>
                <div style={{ fontSize: 12, color: "#0277bd" }}>
                  <strong>💡 Skills to Learn:</strong> FastAPI, GeoJSON
                </div>
                <div style={{ fontSize: 12, color: "#6a1b9a" }}>
                  <strong>🎯 Target Role Match:</strong> Full Stack Developer
                </div>
              </div>
            </div>

            {/* Action buttons for Student B */}
            {priyaRequest?.status === "pending" ? (
              <div
                style={{
                  background: "rgba(234,179,8,0.12)",
                  color: "#ca8a04",
                  padding: "10px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                ⏳ Join Request Submitted & Pending Approval from {leadName} (Project Lead).
              </div>
            ) : (
              <button className="mint-btn" style={{ padding: "10px 24px", fontSize: 13 }} onClick={handleSendJoinRequest}>
                🚀 Request to Join Team →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE PROJECT DASHBOARD (Visible to Student A, or Student B once accepted) */}
      {(isStudentA || priyaRequest?.status === "accepted") && (
        <div>
          {/* Project Details Header & Controls */}
          <div className="card" style={{ padding: 24, marginBottom: 28, background: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  <span className="recoleta" style={{ fontSize: 26 }}>{projectState.name}</span>
                  <span
                    className="tag"
                    style={{
                      background: projectState.discoverable ? "rgba(16,185,129,0.12)" : "rgba(100,116,139,0.12)",
                      color: projectState.discoverable ? "#10b981" : "#64748b",
                    }}
                  >
                    {projectState.discoverable ? "Public Discoverable" : "Private"}
                  </span>
                </div>
                <p className="proxima" style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
                  {projectState.description}
                </p>
              </div>

              {/* Controls for Student A */}
              {isStudentA && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleToggleDiscoverable}
                    className="ghost-btn"
                    style={{ fontSize: 12, padding: "8px 14px" }}
                  >
                    {projectState.discoverable ? "Unpublish Listing" : "Make Discoverable"}
                  </button>
                </div>
              )}
            </div>

            {/* Members & Capacity Row */}
            <div style={{ display: "flex", gap: 24, marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 13, color: "#475569" }}>
                <strong>Team Members ({projectState.members.length}/{projectState.teamCapacity}):</strong>{" "}
                {projectState.members.map((m) => m.name).join(", ")}
              </div>
              <div style={{ fontSize: 13, color: "#475569" }}>
                <strong>Repository:</strong> <code>{projectState.github.repoName}</code>
              </div>
            </div>

            {/* Student A Request Inbox Notice */}
            {isStudentA && projectState.joinRequests.some((r) => r.status === "pending") && (
              <div
                style={{
                  marginTop: 16,
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: 10,
                  padding: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8" }}>
                    📬 Pending Join Request from Priya (Student B)
                  </div>
                  <div style={{ fontSize: 12, color: "#3b82f6", marginTop: 2 }}>
                    "{projectState.joinRequests[0].message}"
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="mint-btn"
                    style={{ padding: "6px 14px", fontSize: 12 }}
                    onClick={() => handleDecideRequest("req-b-01", "accepted")}
                  >
                    ✓ Accept Join Request
                  </button>
                  <button
                    className="ghost-btn"
                    style={{ padding: "6px 14px", fontSize: 12 }}
                    onClick={() => handleDecideRequest("req-b-01", "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Workspace Sub-Navigation Tabs */}
          <div style={{ display: "flex", gap: 12, borderBottom: "2px solid rgba(0,0,0,0.08)", marginBottom: 24 }}>
            {[
              { id: "tasks", label: "📋 Tasks & Assignments" },
              { id: "teamspace", label: "💬 Team Space & @mentor" },
              { id: "github", label: "🐙 GitHub Integration & Webhook" },
              { id: "proof", label: "🏅 Proof-of-Work Evidence" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveWorkspaceSubTab(tab.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: activeWorkspaceSubTab === tab.id ? "#00A19B" : "#64748b",
                  borderBottom: activeWorkspaceSubTab === tab.id ? "3px solid #00A19B" : "none",
                  marginBottom: -2,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SUB-TAB 1: TASKS & ASSIGNMENTS */}
          {activeWorkspaceSubTab === "tasks" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div className="recoleta" style={{ fontSize: 20 }}>Project Task Board</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {projectState.tasks.map((task) => (
                  <div key={task.id} className="card" style={{ padding: 20, borderColor: task.assignedTo ? "#00A19B" : "rgba(0,0,0,0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span className="tag" style={{ background: "rgba(0,161,155,0.1)", color: "#00A19B" }}>
                        Task #{task.number}
                      </span>
                      <span
                        className="tag"
                        style={{
                          background:
                            task.status === "completed"
                              ? "rgba(16,185,129,0.15)"
                              : task.status === "pr_submitted"
                              ? "rgba(234,179,8,0.15)"
                              : "rgba(100,116,139,0.1)",
                          color:
                            task.status === "completed"
                              ? "#10b981"
                              : task.status === "pr_submitted"
                              ? "#ca8a04"
                              : "#64748b",
                        }}
                      >
                        {task.status === "completed"
                          ? "✓ Completed & Merged"
                          : task.status === "pr_submitted"
                          ? "PR Linked (#101)"
                          : "To Do"}
                      </span>
                    </div>

                    <div className="recoleta" style={{ fontSize: 18, marginBottom: 6 }}>{task.title}</div>
                    <p className="proxima" style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>{task.description}</p>

                    <div style={{ background: "rgba(0,0,0,0.02)", padding: 12, borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 4 }}>
                        🎯 Completion Criteria:
                      </div>
                      <div style={{ fontSize: 12, color: "#334155" }}>{task.completionCriteria}</div>
                    </div>

                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                      <strong>Required Skills:</strong> {task.requiredSkills.join(", ")}
                    </div>

                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>
                      <strong>Assigned To:</strong>{" "}
                      {task.assignedTo ? (
                        <span style={{ color: "#00A19B", fontWeight: 700 }}>Priya (Student B)</span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>Unassigned</span>
                      )}
                    </div>

                    {/* Task Assignment Action for Student A */}
                    {isStudentA && !task.assignedTo && priyaMember && (
                      <button
                        className="mint-btn"
                        style={{ width: "100%", padding: "8px", fontSize: 12 }}
                        onClick={() => handleAssignTask(task.id, "user-b")}
                      >
                        Assign Task #1 to Priya (Student B)
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: TEAM SPACE & @MENTOR */}
          {activeWorkspaceSubTab === "teamspace" && (
            <div>
              <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div className="recoleta" style={{ fontSize: 20 }}>Team Space & Real-time Chat</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      Reference tasks with <code>#task-1</code> or ask <code>@mentor</code> for immediate AI project guidance.
                    </div>
                  </div>
                  <a
                    href={projectState.teamSpace.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mint-btn"
                    style={{ padding: "8px 16px", fontSize: 12, textDecoration: "none" }}
                  >
                    📹 Open Team Google Meet →
                  </a>
                </div>

                {/* Messages Feed */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: 12,
                    padding: 16,
                    height: 260,
                    overflowY: "auto",
                    marginBottom: 16,
                  }}
                >
                  {projectState.teamSpace.messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        marginBottom: 14,
                        background: msg.isMentor ? "rgba(0,161,155,0.08)" : "#ffffff",
                        border: "1px solid " + (msg.isMentor ? "rgba(0,161,155,0.2)" : "rgba(0,0,0,0.06)"),
                        padding: 12,
                        borderRadius: 10,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <strong style={{ fontSize: 12, color: msg.isMentor ? "#00A19B" : "#1e293b" }}>
                          {msg.author}
                        </strong>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>{msg.time}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#334155" }}>{msg.text}</div>
                    </div>
                  ))}
                  {mentorLoading && (
                    <div style={{ fontSize: 12, color: "#00A19B", fontStyle: "italic" }}>
                      🤖 Śiṣya AI Mentor is typing response...
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    className="input"
                    placeholder="Type message... (e.g. '@mentor how do I handle GeoJSON in #task-1?')"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button className="mint-btn" onClick={handleSendMessage} style={{ padding: "0 20px" }}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: GITHUB INTEGRATION & WEBHOOK PIPELINE */}
          {activeWorkspaceSubTab === "github" && (
            <div>
              <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <div className="recoleta" style={{ fontSize: 20, marginBottom: 12 }}>
                  GitHub Authorization & Webhook Ingestion Engine
                </div>

                {/* Step 1: Connect Identity */}
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                    1. Student B GitHub Identity Connection
                  </div>
                  {projectState.github.studentBConnected ? (
                    <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
                      ✓ Authorized & Linked: <code>{projectState.github.studentBUsername}</code>
                    </div>
                  ) : (
                    <button
                      className="mint-btn"
                      style={{ padding: "8px 16px", fontSize: 12 }}
                      onClick={handleConnectGithub}
                    >
                      Authorize GitHub Account for Priya →
                    </button>
                  )}
                </div>

                {/* Step 2: Interactive Webhook Simulator */}
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
                    2. Webhook Event Pipeline Simulator
                  </div>

                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                    <button
                      className="mint-btn"
                      style={{ padding: "8px 16px", fontSize: 12, opacity: prSubmitting ? 0.6 : 1 }}
                      disabled={prSubmitting || webhookSimulated}
                      onClick={handleSimulatePRSubmission}
                    >
                      {prSubmitting ? "Processing Webhook..." : "Step A: Priya Opens PR #101 with #task-1 reference"}
                    </button>

                    <button
                      className="mint-btn"
                      style={{
                        padding: "8px 16px",
                        fontSize: 12,
                        background: "#0284c7",
                        opacity: !webhookSimulated || projectState.github.prs[0]?.merged ? 0.5 : 1,
                      }}
                      disabled={!webhookSimulated || projectState.github.prs[0]?.merged}
                      onClick={handleSimulatePRMerge}
                    >
                      Step B: Student A Merges PR #101
                    </button>
                  </div>

                  {/* Webhooks Log */}
                  {projectState.github.webhooks.length > 0 && (
                    <div style={{ background: "#0f172a", color: "#38bdf8", padding: 14, borderRadius: 8, fontFamily: "monospace", fontSize: 11 }}>
                      <div style={{ color: "#94a3b8", marginBottom: 6 }}>// Signed GitHub Webhook Delivery Ingestion Log:</div>
                      {projectState.github.webhooks.map((wh, idx) => (
                        <div key={idx} style={{ marginBottom: 4 }}>
                          [HMAC SHA256 VERIFIED] Delivery: {wh.delivery} | Event: {wh.event} ({wh.time})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: PROOF-OF-WORK EVIDENCE */}
          {activeWorkspaceSubTab === "proof" && (
            <div>
              <div className="card" style={{ padding: 24 }}>
                <div className="recoleta" style={{ fontSize: 20, marginBottom: 12 }}>
                  Student B (Priya) Verified Proof-of-Work Profile
                </div>

                {projectState.github.skillEvidence.length > 0 ? (
                  <div>
                    <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46", marginBottom: 4 }}>
                        🏆 Verified Contribution Recorded!
                      </div>
                      <div style={{ fontSize: 12, color: "#047857" }}>
                        PR #101 merged by Student A into <code>{projectState.github.repoName}</code>. Task #1 marked complete.
                      </div>
                    </div>

                    <div className="recoleta" style={{ fontSize: 16, marginBottom: 12, color: "#334155" }}>
                      Demonstrated Skill Evidence Cards:
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      {projectState.github.skillEvidence.map((ev) => (
                        <div key={ev.id} className="card" style={{ padding: 16, borderColor: "rgba(0,161,155,0.3)" }}>
                          <span className="tag" style={{ background: "rgba(0,161,155,0.12)", color: "#00A19B", marginBottom: 8 }}>
                            {ev.skill}
                          </span>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", marginTop: 4 }}>
                            {ev.kind}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                            {ev.explanation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>
                    No verified PR merges recorded yet. Complete Step A & Step B under the GitHub Integration tab!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

