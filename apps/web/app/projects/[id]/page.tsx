"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  api,
  getKanban,
  generateRoadmap,
  getProjectDependencies,
  createTaskBlocker,
  resolveTaskBlocker,
  getProjectSprints,
  createProjectSprint,
  getProjectWorkload,
  getNextBestAction,
  updateTaskDetails,
  addTaskDependency,
  ProjectDependenciesResponse,
  ProjectSprintDTO,
  ProjectWorkloadResponse,
  NextBestActionResponse,
} from "@/lib/api";
import PageBack from "@/components/PageBack";
import Breadcrumbs from "@/components/Breadcrumbs";
import { TaskCard } from "@/components/kanban/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KanbanBoardData {
  backlog: any[];
  todo: any[];
  in_progress: any[];
  in_review: any[];
  done: any[];
}

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "kanban" | "execution" | "sprints" | "dependencies" | "team_space" | "github" | "evidence"
  >("kanban");

  // E8 Execution State
  const [nextAction, setNextAction] = useState<NextBestActionResponse | null>(null);
  const [workload, setWorkload] = useState<ProjectWorkloadResponse | null>(null);
  const [sprints, setSprints] = useState<ProjectSprintDTO[]>([]);
  const [dependencies, setDependencies] = useState<ProjectDependenciesResponse | null>(null);

  // E8 Modals & Form State
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [sprintStartDate, setSprintStartDate] = useState("");
  const [sprintEndDate, setSprintEndDate] = useState("");
  const [sprintCapacity, setSprintCapacity] = useState(40.0);
  const [submittingSprint, setSubmittingSprint] = useState(false);

  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [blockerTaskId, setBlockerTaskId] = useState("");
  const [blockerReason, setBlockerReason] = useState("");
  const [submittingBlocker, setSubmittingBlocker] = useState(false);

  const [showDepModal, setShowDepModal] = useState(false);
  const [depSourceTaskId, setDepSourceTaskId] = useState("");
  const [depTargetTaskId, setDepTargetTaskId] = useState("");
  const [submittingDep, setSubmittingDep] = useState(false);

  // Kanban State
  const [kanban, setKanban] = useState<KanbanBoardData>({
    backlog: [],
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // AI Architect State
  const [showArchitect, setShowArchitect] = useState(false);
  const [architectIdea, setArchitectIdea] = useState("");
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [generating, setGenerating] = useState(false);

  // Team Space & Chat State
  const [teamSpace, setTeamSpace] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Google Meeting State
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingUrlInput, setMeetingUrlInput] = useState("");
  const [updatingMeeting, setUpdatingMeeting] = useState(false);

  // GitHub Telemetry & Linking State
  const [githubTelemetry, setGithubTelemetry] = useState<any>(null);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [userRepos, setUserRepos] = useState<any[]>([]);
  const [selectedRepoFull, setSelectedRepoFull] = useState("");
  const [installationIdInput, setInstallationIdInput] = useState("999111");
  const [linkingRepo, setLinkingRepo] = useState(false);

  const loadWorkspace = useCallback(async () => {
    if (!id) return;
    try {
      setError("");
      const pData = await api(`/projects/${id}`);
      setProject(pData);

      // Load Kanban
      const kData = await getKanban(id);
      setKanban({
        backlog: kData.backlog || [],
        todo: kData.todo || [],
        in_progress: kData.in_progress || [],
        in_review: kData.in_review || kData.review || [],
        done: kData.done || [],
      });

      // Load E8 Execution Engines
      try {
        const [naRes, wlRes, spRes, depRes] = await Promise.all([
          getNextBestAction(id).catch(() => null),
          getProjectWorkload(id).catch(() => null),
          getProjectSprints(id).catch(() => []),
          getProjectDependencies(id).catch(() => null),
        ]);
        if (naRes) setNextAction(naRes);
        if (wlRes) setWorkload(wlRes);
        if (Array.isArray(spRes)) setSprints(spRes);
        if (depRes) setDependencies(depRes);
      } catch {
        // Fallback for execution engines
      }

      // Load Team Space
      try {
        const tsData = await api(`/projects/${id}/team-space`);
        setTeamSpace(tsData);
        if (tsData.meeting_url) {
          setMeetingUrlInput(tsData.meeting_url);
        }
      } catch {
        // Non-team or missing team space fallback
      }

      // Load GitHub Telemetry
      try {
        const ghData = await api(`/projects/${id}/github/evidence`);
        setGithubTelemetry(ghData);
      } catch {
        // No repo connected yet
      }
    } catch (err: any) {
      setError(err.message || "Failed to load project workspace");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  // E8 Execution Handlers
  async function handleCreateSprint(e: React.FormEvent) {
    e.preventDefault();
    if (!sprintName || !sprintGoal || !sprintStartDate || !sprintEndDate) return;
    setSubmittingSprint(true);
    setError("");
    try {
      await createProjectSprint(id, {
        name: sprintName,
        goal: sprintGoal,
        start_date: new Date(sprintStartDate).toISOString(),
        end_date: new Date(sprintEndDate).toISOString(),
        capacity_hours: Number(sprintCapacity) || 40.0,
      });
      setShowSprintModal(false);
      setSprintName("");
      setSprintGoal("");
      setNotice("✅ Sprint created successfully!");
      await loadWorkspace();
    } catch (err: any) {
      setError(err.message || "Failed to create sprint. Ensure end date is on or after start date.");
    } finally {
      setSubmittingSprint(false);
    }
  }

  async function handleCreateBlocker(e: React.FormEvent) {
    e.preventDefault();
    if (!blockerTaskId || !blockerReason) return;
    setSubmittingBlocker(true);
    setError("");
    try {
      await createTaskBlocker(blockerTaskId, blockerReason);
      setShowBlockerModal(false);
      setBlockerTaskId("");
      setBlockerReason("");
      setNotice("⚠️ Task blocker reported successfully!");
      await loadWorkspace();
    } catch (err: any) {
      setError(err.message || "Failed to report blocker.");
    } finally {
      setSubmittingBlocker(false);
    }
  }

  async function handleResolveBlocker(blockerId: string) {
    setError("");
    try {
      await resolveTaskBlocker(blockerId);
      setNotice("✅ Blocker resolved successfully!");
      await loadWorkspace();
    } catch (err: any) {
      setError(err.message || "Failed to resolve blocker.");
    }
  }

  async function handleAddDependency(e: React.FormEvent) {
    e.preventDefault();
    if (!depSourceTaskId || !depTargetTaskId) return;
    setSubmittingDep(true);
    setError("");
    try {
      await addTaskDependency(depSourceTaskId, depTargetTaskId, "BLOCKS");
      setShowDepModal(false);
      setDepSourceTaskId("");
      setDepTargetTaskId("");
      setNotice("✅ Dependency link added successfully!");
      await loadWorkspace();
    } catch (err: any) {
      setError(err.message || "Failed to add dependency link (check for circular loops).");
    } finally {
      setSubmittingDep(false);
    }
  }

  // Load User GitHub Repos for Modal
  const loadUserRepos = async () => {
    try {
      const res = await api("/integrations/github/repositories");
      setUserRepos(res.repositories || []);
    } catch (err: any) {
      try {
        const fallback = await api("/github/repositories");
        setUserRepos(fallback.repositories || []);
      } catch {
        // Not connected
      }
    }
  };

  async function handleGenerateRoadmap(e: React.FormEvent) {
    e.preventDefault();
    if (!architectIdea.trim() || generating) return;
    setGenerating(true);
    setError("");
    setNotice("");
    try {
      const res = await generateRoadmap(id, architectIdea, skillLevel);
      setNotice(`Roadmap generated! Created ${res.tasks_count || 0} tasks.`);
      setShowArchitect(false);
      await loadWorkspace();
    } catch (err: any) {
      setError(err.message || "Could not generate project architecture.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!chatMessage.trim() || sendingMessage) return;
    setSendingMessage(true);
    setError("");
    try {
      const res = await api(`/projects/${id}/team-space/messages`, {
        method: "POST",
        body: JSON.stringify({ body: chatMessage.trim(), mentioned_user_ids: [] }),
      });
      setChatMessage("");
      if (res.messages && teamSpace) {
        setTeamSpace({ ...teamSpace, messages: res.messages });
      } else {
        await loadWorkspace();
      }
    } catch (err: any) {
      setError(err.message || "Failed to send message.");
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleSaveMeeting(e: React.FormEvent) {
    e.preventDefault();
    setUpdatingMeeting(true);
    setError("");
    try {
      const res = await api(`/projects/${id}/team-space/meeting`, {
        method: "PATCH",
        body: JSON.stringify({ meeting_url: meetingUrlInput.trim() || null }),
      });
      if (teamSpace) {
        setTeamSpace({ ...teamSpace, meeting_url: res.meeting_url });
      }
      setShowMeetingModal(false);
      setNotice("Google Meeting link updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update Google Meeting link.");
    } finally {
      setUpdatingMeeting(false);
    }
  }

  async function handleLinkRepository(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRepoFull && !githubTelemetry?.repository) return;
    setLinkingRepo(true);
    setError("");
    try {
      await api(`/projects/${id}/github/repository`, {
        method: "POST",
        body: JSON.stringify({
          installation_id: Number(installationIdInput) || 999111,
          full_name: selectedRepoFull,
        }),
      });
      setShowGithubModal(false);
      setNotice("GitHub Repository linked successfully!");
      await loadWorkspace();
    } catch (err: any) {
      setError(err.message || "Failed to link GitHub repository.");
    } finally {
      setLinkingRepo(false);
    }
  }

  const handleStatusChange = (_taskId: string, _newStatus: string) => {
    loadWorkspace();
  };

  if (loading) {
    return (
      <main className="shell formPage" style={{ background: "#f7f2eb", minHeight: "100vh" }}>
        <PageBack href="/projects" label="Back to Projects" />
        <p style={{ color: "#7a6f67", marginTop: "20px" }}>Loading project workspace...</p>
      </main>
    );
  }

  const columns: Array<{ id: keyof KanbanBoardData; label: string; icon: string }> = [
    { id: "todo", label: "To Do", icon: "📋" },
    { id: "in_progress", label: "In Progress", icon: "⚡" },
    { id: "in_review", label: "In Review", icon: "🔍" },
    { id: "done", label: "Done", icon: "✅" },
  ];

  const totalTasks =
    kanban.todo.length +
    kanban.in_progress.length +
    kanban.in_review.length +
    kanban.done.length +
    kanban.backlog.length;

  return (
    <main className="shell formPage" style={{ background: "#f7f2eb", minHeight: "100vh", paddingBottom: "60px" }}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projects", href: "/projects" },
        ]}
        current={project?.title || "Project Workspace"}
      />

      {/* Main Header Card */}
      <div
        style={{
          background: "#eee8df",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span className="tag" style={{ background: "#00a19b", color: "#ffffff", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                {project?.collaboration_mode === "TEAM" ? "🤝 TEAM PROJECT" : "👤 SOLO PROJECT"}
              </span>
              <span style={{ fontSize: "12px", color: "#7a6f67" }}>
                Status: <strong style={{ color: "#1a1410" }}>{project?.status || "active"}</strong>
              </span>
            </div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "32px", color: "#1a1410", margin: "4px 0 8px" }}>
              {project?.title || "Project Workspace"}
            </h1>
            {project?.description && (
              <p style={{ fontSize: "15px", color: "#7a6f67", margin: "0 0 12px 0", maxWidth: "720px" }}>
                {project.description}
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {(project?.tech_stack || []).map((t: string) => (
                <Badge key={t} style={{ background: "#1a1410", color: "#ffffff", fontSize: "11px" }}>
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          {/* Header Quick Action Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            <Button
              variant="outline"
              style={{ borderColor: "#00a19b", color: "#00a19b", background: "transparent" }}
              onClick={() => setShowArchitect(!showArchitect)}
            >
              🏗️ {showArchitect ? "Close Architect" : "AI Architect"}
            </Button>

            {teamSpace?.meeting_url ? (
              <a href={teamSpace.meeting_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <Button style={{ background: "#00a19b", color: "#ffffff" }}>
                  📹 Join Google Meet
                </Button>
              </a>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowMeetingModal(true)}
                style={{ borderColor: "#1a1410", color: "#1a1410" }}
              >
                📹 Add Google Meet
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => {
                setShowGithubModal(true);
                loadUserRepos();
              }}
              style={{ borderColor: "#1a1410", color: "#1a1410" }}
            >
              🐙 {githubTelemetry?.repository ? "GitHub Repo Linked" : "Connect GitHub Repo"}
            </Button>

            <Button
              style={{ background: "#1a1410", color: "#ffffff" }}
              onClick={() => router.push(`/projects/${id}/collaboration`)}
            >
              ⚙️ Collaboration Settings
            </Button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            overflowX: "auto",
          }}
        >
          <button
            onClick={() => setActiveTab("kanban")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: activeTab === "kanban" ? "#1a1410" : "rgba(0,0,0,0.04)",
              color: activeTab === "kanban" ? "#ffffff" : "#1a1410",
              transition: "all 0.2s",
            }}
          >
            📋 Kanban Board ({totalTasks})
          </button>

          <button
            onClick={() => setActiveTab("execution")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: activeTab === "execution" ? "#1a1410" : "rgba(0,0,0,0.04)",
              color: activeTab === "execution" ? "#ffffff" : "#1a1410",
              transition: "all 0.2s",
            }}
          >
            ⚡ Next Action & Workload
          </button>

          <button
            onClick={() => setActiveTab("sprints")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: activeTab === "sprints" ? "#1a1410" : "rgba(0,0,0,0.04)",
              color: activeTab === "sprints" ? "#ffffff" : "#1a1410",
              transition: "all 0.2s",
            }}
          >
            🚀 Sprints ({sprints.length})
          </button>

          <button
            onClick={() => setActiveTab("dependencies")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: activeTab === "dependencies" ? "#1a1410" : "rgba(0,0,0,0.04)",
              color: activeTab === "dependencies" ? "#ffffff" : "#1a1410",
              transition: "all 0.2s",
            }}
          >
            🔗 Dependencies & Blockers {dependencies?.blocked_tasks?.length ? `(${dependencies.blocked_tasks.length} blocked)` : ""}
          </button>

          <button
            onClick={() => setActiveTab("team_space")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: activeTab === "team_space" ? "#1a1410" : "rgba(0,0,0,0.04)",
              color: activeTab === "team_space" ? "#ffffff" : "#1a1410",
              transition: "all 0.2s",
            }}
          >
            💬 Team Chat & Space {teamSpace?.messages?.length ? `(${teamSpace.messages.length})` : ""}
          </button>

          <button
            onClick={() => setActiveTab("github")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: activeTab === "github" ? "#1a1410" : "rgba(0,0,0,0.04)",
              color: activeTab === "github" ? "#ffffff" : "#1a1410",
              transition: "all 0.2s",
            }}
          >
            🐙 GitHub Telemetry {githubTelemetry?.commits?.length ? `(${githubTelemetry.commits.length} commits)` : ""}
          </button>

          <button
            onClick={() => setActiveTab("evidence")}
            style={{
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: activeTab === "evidence" ? "#1a1410" : "rgba(0,0,0,0.04)",
              color: activeTab === "evidence" ? "#ffffff" : "#1a1410",
              transition: "all 0.2s",
            }}
          >
            🏆 Verified Proof & Evidence
          </button>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: "16px", padding: "12px", borderRadius: "8px", background: "#fee2e2", color: "#991b1b" }}>{error}</div>}
      {notice && <div className="notice" style={{ marginBottom: "16px", padding: "12px", borderRadius: "8px", background: "#d1fae5", color: "#065f46" }}>{notice}</div>}

      {/* AI Architect Generator Form */}
      {showArchitect && (
        <Card style={{ marginBottom: "28px", border: "1px solid rgba(0, 161, 155, 0.4)", background: "#eee8df" }}>
          <CardHeader>
            <CardTitle style={{ color: "#1a1410" }}>🏗️ AI Project Architect Blueprint Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateRoadmap} style={{ display: "grid", gap: "14px" }}>
              <p style={{ fontSize: "13px", color: "#7a6f67", margin: 0 }}>
                Describe your project idea. The AI Architect will generate milestones and persist actionable tasks to your PostgreSQL/SQLite database.
              </p>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#1a1410" }}>
                  Project Idea & Requirements
                </label>
                <Input
                  value={architectIdea}
                  onChange={(e) => setArchitectIdea(e.target.value)}
                  placeholder="e.g. Build a high-throughput distributed Key-Value store in Python with Raft consensus"
                  required
                  style={{ background: "#ffffff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#1a1410" }}>
                  Target Skill Level
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(0, 0, 0, 0.16)",
                    background: "#ffffff",
                    fontSize: "14px",
                  }}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Button style={{ background: "#00a19b", color: "#ffffff" }} type="submit" disabled={generating}>
                  {generating ? "Generating Blueprint..." : "Generate Roadmap & Persist Tasks →"}
                </Button>
                <Button variant="outline" type="button" onClick={() => setShowArchitect(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 1: KANBAN BOARD */}
      {activeTab === "kanban" && (
        <section>
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", color: "#1a1410", margin: 0 }}>Project Kanban Board</h2>
            <span style={{ fontSize: "13px", color: "#7a6f67" }}>Total Tasks: {totalTasks}</span>
          </div>

          {totalTasks === 0 ? (
            <Card style={{ textAlign: "center", padding: "40px 20px", background: "#eee8df" }}>
              <p style={{ margin: "0 0 16px 0", color: "#7a6f67" }}>
                No tasks in this workspace yet. Trigger the AI Architect to generate a complete task roadmap!
              </p>
              <Button style={{ background: "#00a19b", color: "#ffffff" }} onClick={() => setShowArchitect(true)}>
                🏗️ Trigger AI Architect
              </Button>
            </Card>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "16px",
                alignItems: "start",
              }}
            >
              {columns.map((col) => {
                const taskList = kanban[col.id] || [];
                return (
                  <div
                    key={col.id}
                    style={{
                      background: "#eee8df",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      borderRadius: "14px",
                      padding: "14px",
                      minHeight: "360px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "14px",
                        paddingBottom: "8px",
                        borderBottom: "2px solid rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      <h3 style={{ fontSize: "15px", fontWeight: "bold", margin: 0, display: "flex", alignItems: "center", gap: "6px", color: "#1a1410" }}>
                        <span>{col.icon}</span> {col.label}
                      </h3>
                      <Badge style={{ background: "#1a1410", color: "#ffffff" }}>{taskList.length}</Badge>
                    </div>

                    {taskList.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "#7a6f67", fontStyle: "italic", textAlign: "center", marginTop: "20px" }}>
                        No tasks in {col.label.toLowerCase()}
                      </p>
                    ) : (
                      taskList.map((task: any) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          projectId={id}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB: EXECUTION INTELLIGENCE & WORKLOAD */}
      {activeTab === "execution" && (
        <section className="space-y-6">
          {/* Next Best Action Card */}
          <Card style={{ background: "#eee8df", border: "1px solid rgba(0,0,0,0.1)" }}>
            <CardHeader style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <CardTitle style={{ color: "#1a1410", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="flex items-center gap-2">⚡ Next Best Action Recommendation</span>
                {nextAction?.priority && (
                  <Badge style={{ background: "#00a19b", color: "#ffffff", fontSize: "11px" }}>
                    Priority: {nextAction.priority}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: "20px" }}>
              {nextAction?.task_title ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#1a1410", margin: 0, fontFamily: "Georgia, serif" }}>
                      {nextAction.task_title}
                    </h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {nextAction.is_critical_path && (
                        <span style={{ fontSize: "11px", background: "rgba(220, 38, 38, 0.12)", color: "#dc2626", padding: "3px 10px", borderRadius: "12px", fontWeight: "bold" }}>
                          ⚡ CRITICAL PATH
                        </span>
                      )}
                      {nextAction.is_blocked ? (
                        <span style={{ fontSize: "11px", background: "rgba(234, 179, 8, 0.15)", color: "#ca8a04", padding: "3px 10px", borderRadius: "12px", fontWeight: "bold" }}>
                          ⚠️ BLOCKED
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", background: "rgba(16, 185, 129, 0.15)", color: "#059669", padding: "3px 10px", borderRadius: "12px", fontWeight: "bold" }}>
                          ✅ UNBLOCKED & READY
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: "14px", color: "#7a6f67", background: "#ffffff", padding: "14px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", margin: 0 }}>
                    {nextAction.reason}
                  </p>
                  {nextAction.next_recommendation && (
                    <p style={{ fontSize: "13px", color: "#00a19b", fontWeight: "600", margin: 0 }}>
                      👉 {nextAction.next_recommendation}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{ color: "#7a6f67", fontStyle: "italic", textAlign: "center", margin: "20px 0" }}>
                  {nextAction?.reason || "🎉 All project tasks are currently completed! Great job."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Workload & Capacity Engine Card */}
          <Card style={{ background: "#eee8df", border: "1px solid rgba(0,0,0,0.1)" }}>
            <CardHeader style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <CardTitle style={{ color: "#1a1410" }}>📊 Team Capacity & Workload Balance</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: "20px" }}>
              {workload?.is_overloaded && (
                <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#dc2626", padding: "12px 16px", borderRadius: "12px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
                  ⚠️ OVERLOAD ALERT: One or more team members have assigned hours exceeding weekly capacity (20h limit). Reassign or re-scope tasks to prevent bottlenecking.
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                {(workload?.members || []).map((m) => (
                  <div key={m.user_id} style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <strong style={{ fontSize: "15px", color: "#1a1410" }}>{m.name} ({m.role})</strong>
                      <span style={{ fontSize: "12px", color: m.is_overloaded ? "#dc2626" : "#00a19b", fontWeight: "bold" }}>
                        {m.utilization_percentage}% Utilized
                      </span>
                    </div>
                    <div style={{ width: "100%", background: "rgba(0,0,0,0.08)", height: "8px", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
                      <div style={{ width: `${Math.min(m.utilization_percentage, 100)}%`, background: m.is_overloaded ? "#dc2626" : "#00a19b", height: "100%" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", color: "#7a6f67" }}>
                      <div>Assigned: <strong style={{ color: "#1a1410" }}>{m.assigned_hours}h</strong></div>
                      <div>Capacity: <strong style={{ color: "#1a1410" }}>{m.capacity_hours}h</strong></div>
                      <div>Completed: <strong style={{ color: "#1a1410" }}>{m.completed_hours}h</strong></div>
                      <div>Remaining: <strong style={{ color: "#1a1410" }}>{m.remaining_hours}h</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* TAB: SPRINTS ENGINE */}
      {activeTab === "sprints" && (
        <section className="space-y-6">
          <Card style={{ background: "#eee8df", border: "1px solid rgba(0,0,0,0.1)" }}>
            <CardHeader style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <CardTitle style={{ color: "#1a1410" }}>🚀 Sprint Milestones & Execution Loops</CardTitle>
              <Button style={{ background: "#1a1410", color: "#ffffff" }} onClick={() => setShowSprintModal(true)}>
                + Create New Sprint
              </Button>
            </CardHeader>
            <CardContent style={{ padding: "20px" }}>
              {sprints.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <p style={{ color: "#7a6f67", fontStyle: "italic", marginBottom: "16px" }}>No active sprint yet.</p>
                  <Button style={{ background: "#00a19b", color: "#ffffff" }} onClick={() => setShowSprintModal(true)}>
                    Start Sprint 1
                  </Button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "16px" }}>
                  {sprints.map((s) => (
                    <div key={s.id} style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "14px", padding: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <h4 style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1410", margin: 0 }}>{s.name}</h4>
                            <Badge style={{ background: s.status === "ACTIVE" ? "#00a19b" : "#1a1410", color: "#ffffff", fontSize: "11px" }}>
                              {s.status}
                            </Badge>
                          </div>
                          <p style={{ fontSize: "14px", color: "#7a6f67", marginTop: "4px" }}>Goal: {s.goal}</p>
                        </div>
                        <div style={{ textAlign: "right", fontSize: "12px", color: "#7a6f67" }}>
                          <div>{new Date(s.start_date).toLocaleDateString()} — {new Date(s.end_date).toLocaleDateString()}</div>
                          <div style={{ fontWeight: "bold", color: "#1a1410", marginTop: "2px" }}>Capacity: {s.capacity_hours}h</div>
                        </div>
                      </div>
                      <div style={{ marginTop: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "bold", marginBottom: "4px", color: "#1a1410" }}>
                          <span>Sprint Progress</span>
                          <span>{s.completed_task_count} / {s.task_count} Tasks ({s.progress_percentage}%)</span>
                        </div>
                        <div style={{ width: "100%", background: "rgba(0,0,0,0.08)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                          <div style={{ width: `${s.progress_percentage}%`, background: "#00a19b", height: "100%" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* TAB: DEPENDENCIES & BLOCKERS ENGINE */}
      {activeTab === "dependencies" && (
        <section className="space-y-6">
          {/* Active Blockers Section */}
          <Card style={{ background: "#eee8df", border: "1px solid rgba(0,0,0,0.1)" }}>
            <CardHeader style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <CardTitle style={{ color: "#1a1410" }}>⚠️ Active Task Blockers & AI Advisory</CardTitle>
              <Button style={{ background: "#dc2626", color: "#ffffff" }} onClick={() => setShowBlockerModal(true)}>
                + Report New Blocker
              </Button>
            </CardHeader>
            <CardContent style={{ padding: "20px" }}>
              {(!dependencies?.blocked_tasks || dependencies.blocked_tasks.length === 0) ? (
                <p style={{ color: "#7a6f67", fontStyle: "italic", textAlign: "center", margin: "20px 0" }}>
                  🎉 Zero active blockers reported! Tasks are clear for execution.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {dependencies.nodes.filter(n => n.is_blocked).map((n) => (
                    <div key={n.id} style={{ background: "#ffffff", border: "1px solid rgba(234,179,8,0.4)", borderRadius: "12px", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <strong style={{ fontSize: "16px", color: "#1a1410" }}>Task: {n.title}</strong>
                        <Button variant="outline" style={{ borderColor: "#00a19b", color: "#00a19b", fontSize: "12px" }} onClick={() => handleResolveBlocker(n.id)}>
                          Resolve Blocker ✓
                        </Button>
                      </div>
                      <p style={{ fontSize: "13px", color: "#ca8a04", margin: "0 0 8px 0", fontWeight: "600" }}>
                        Status: Task is BLOCKED. Cannot move to DONE until prerequisite dependencies or blockers are resolved.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dependency DAG & Links Section */}
          <Card style={{ background: "#eee8df", border: "1px solid rgba(0,0,0,0.1)" }}>
            <CardHeader style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <CardTitle style={{ color: "#1a1410" }}>🔗 Deterministic Dependency Graph & Critical Path</CardTitle>
              <Button style={{ background: "#1a1410", color: "#ffffff" }} onClick={() => setShowDepModal(true)}>
                + Link Task Dependency
              </Button>
            </CardHeader>
            <CardContent style={{ padding: "20px" }}>
              <div style={{ marginBottom: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#1a1410", marginBottom: "8px" }}>Critical Path Nodes:</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {(dependencies?.critical_path || []).map((cpId) => {
                    const node = dependencies?.nodes.find(n => n.id === cpId);
                    return (
                      <Badge key={cpId} style={{ background: "#00a19b", color: "#ffffff", padding: "6px 12px", fontSize: "12px" }}>
                        ⚡ {node?.title || cpId}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "14px", fontWeight: "bold", color: "#1a1410", marginBottom: "8px" }}>Active Dependency Links:</h4>
                {(!dependencies?.edges || dependencies.edges.length === 0) ? (
                  <p style={{ color: "#7a6f67", fontStyle: "italic", fontSize: "13px" }}>No task dependency links defined yet.</p>
                ) : (
                  <div style={{ display: "grid", gap: "8px" }}>
                    {dependencies.edges.map((e) => {
                      const sourceTask = dependencies.nodes.find(n => n.id === e.depends_on_task_id);
                      const targetTask = dependencies.nodes.find(n => n.id === e.task_id);
                      return (
                        <div key={e.id} style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.06)", fontSize: "13px" }}>
                          <strong style={{ color: "#1a1410" }}>{sourceTask?.title || e.depends_on_task_id}</strong>
                          <span style={{ color: "#00a19b", fontWeight: "bold", margin: "0 8px" }}>BLOCKS ➔</span>
                          <strong style={{ color: "#1a1410" }}>{targetTask?.title || e.task_id}</strong>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* TAB 2: TEAM SPACE & CHAT */}
      {activeTab === "team_space" && (
        <section style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
          {/* Chat Feed */}
          <Card style={{ background: "#eee8df", border: "1px solid rgba(0,0,0,0.1)" }}>
            <CardHeader style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <CardTitle style={{ color: "#1a1410", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>💬 Team Chat & Śiṣya Mentor</span>
                <span style={{ fontSize: "12px", color: "#7a6f67", fontWeight: "normal" }}>
                  Tip: Include @mentor, Task #N, or PR #N
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  maxHeight: "440px",
                  overflowY: "auto",
                  paddingRight: "6px",
                  marginBottom: "16px",
                }}
              >
                {(!teamSpace?.messages || teamSpace.messages.length === 0) ? (
                  <p style={{ color: "#7a6f67", fontStyle: "italic", textAlign: "center", margin: "40px 0" }}>
                    No chat messages yet. Start the conversation with your team or ask @mentor for advice!
                  </p>
                ) : (
                  teamSpace.messages.map((m: any) => (
                    <div
                      key={m.id}
                      style={{
                        background: m.author_kind === "mentor" ? "rgba(0, 161, 155, 0.08)" : "#ffffff",
                        border: m.author_kind === "mentor" ? "1px solid rgba(0, 161, 155, 0.3)" : "1px solid rgba(0,0,0,0.06)",
                        borderRadius: "12px",
                        padding: "12px 16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <strong style={{ fontSize: "13px", color: m.author_kind === "mentor" ? "#00a19b" : "#1a1410" }}>
                          {m.author_kind === "mentor" ? "🤖 Śiṣya Mentor AI" : m.author_name}
                        </strong>
                        <span style={{ fontSize: "11px", color: "#7a6f67" }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p style={{ fontSize: "14px", color: "#1a1410", margin: 0, whiteSpace: "pre-wrap" }}>
                        {m.body}
                      </p>

                      {/* References */}
                      {m.references && m.references.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                          {m.references.map((ref: any, idx: number) => (
                            <Badge key={idx} style={{ background: "rgba(0,0,0,0.06)", color: "#1a1410", fontSize: "11px" }}>
                              {ref.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Send Form */}
              <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "10px" }}>
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message... Use @mentor for AI help or reference Task #1"
                  required
                  style={{ background: "#ffffff", flex: 1 }}
                />
                <Button style={{ background: "#00a19b", color: "#ffffff" }} type="submit" disabled={sendingMessage}>
                  {sendingMessage ? "Sending..." : "Send →"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sidebar: Team Members & Meeting Link */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Card style={{ background: "#eee8df", border: "1px solid rgba(0,0,0,0.1)" }}>
              <CardHeader>
                <CardTitle style={{ fontSize: "16px", color: "#1a1410" }}>👥 Team Members</CardTitle>
              </CardHeader>
              <CardContent style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(teamSpace?.members || []).map((mem: any) => (
                  <div
                    key={mem.user_id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: "#ffffff",
                      padding: "8px 12px",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1a1410" }}>{mem.name}</div>
                      <div style={{ fontSize: "11px", color: "#7a6f67" }}>{mem.role}</div>
                    </div>
                    <Badge style={{ background: mem.role === "owner" ? "#00a19b" : "#1a1410", color: "#ffffff", fontSize: "10px" }}>
                      {mem.role}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card style={{ background: "#eee8df", border: "1px solid rgba(0,0,0,0.1)" }}>
              <CardHeader>
                <CardTitle style={{ fontSize: "16px", color: "#1a1410" }}>📹 Google Meeting</CardTitle>
              </CardHeader>
              <CardContent style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {teamSpace?.meeting_url ? (
                  <>
                    <p style={{ fontSize: "12px", color: "#7a6f67", margin: 0, wordBreak: "break-all" }}>
                      {teamSpace.meeting_url}
                    </p>
                    <a href={teamSpace.meeting_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <Button style={{ background: "#00a19b", color: "#ffffff", width: "100%" }}>
                        Join Video Call ↗
                      </Button>
                    </a>
                  </>
                ) : (
                  <p style={{ fontSize: "12px", color: "#7a6f67", margin: 0 }}>
                    No active Google Meeting URL configured.
                  </p>
                )}

                <Button variant="outline" onClick={() => setShowMeetingModal(true)} style={{ width: "100%" }}>
                  {teamSpace?.meeting_url ? "Update Meeting URL" : "Set Google Meet URL"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* TAB 3: GITHUB TELEMETRY */}
      {activeTab === "github" && (
        <section style={{ display: "grid", gap: "20px" }}>
          <Card style={{ background: "#eee8df", border: "1px solid rgba(0,0,0,0.1)" }}>
            <CardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <CardTitle style={{ color: "#1a1410" }}>🐙 Connected GitHub Repository</CardTitle>
              <Button
                style={{ background: "#00a19b", color: "#ffffff" }}
                onClick={() => {
                  setShowGithubModal(true);
                  loadUserRepos();
                }}
              >
                {githubTelemetry?.repository ? "Change Repository" : "Connect Repository"}
              </Button>
            </CardHeader>
            <CardContent>
              {githubTelemetry?.repository ? (
                <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: "bold", margin: "0 0 4px 0", color: "#1a1410" }}>
                        {githubTelemetry.repository.full_name}
                      </h3>
                      <a
                        href={githubTelemetry.repository.html_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: "13px", color: "#00a19b" }}
                      >
                        {githubTelemetry.repository.html_url} ↗
                      </a>
                    </div>
                    <Badge style={{ background: "#1a1410", color: "#ffffff" }}>
                      {githubTelemetry.repository.is_private ? "Private Repo" : "Public Repo"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "30px 20px" }}>
                  <p style={{ color: "#7a6f67", margin: "0 0 12px 0" }}>
                    No GitHub repository linked to this project workspace yet.
                  </p>
                  <Button
                    style={{ background: "#00a19b", color: "#ffffff" }}
                    onClick={() => {
                      setShowGithubModal(true);
                      loadUserRepos();
                    }}
                  >
                    Connect GitHub Repository
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Telemetry Breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Commits */}
            <Card style={{ background: "#eee8df", border: "1px solid rgba(0,0,0,0.1)" }}>
              <CardHeader>
                <CardTitle style={{ fontSize: "16px", color: "#1a1410" }}>
                  📝 Commit Telemetry ({githubTelemetry?.commits?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
                {(!githubTelemetry?.commits || githubTelemetry.commits.length === 0) ? (
                  <p style={{ fontSize: "12px", color: "#7a6f67", fontStyle: "italic" }}>No push commits recorded yet.</p>
                ) : (
                  githubTelemetry.commits.map((c: any) => (
                    <div key={c.id || c.sha} style={{ background: "#ffffff", padding: "10px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1a1410" }}>{c.message}</div>
                      <div style={{ fontSize: "11px", color: "#7a6f67", display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                        <span>Author: {c.github_actor_login || "Student"}</span>
                        <span>{c.sha ? c.sha.substring(0, 7) : ""}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Pull Requests */}
            <Card style={{ background: "#eee8df", border: "1px solid rgba(0,0,0,0.1)" }}>
              <CardHeader>
                <CardTitle style={{ fontSize: "16px", color: "#1a1410" }}>
                  🔀 Pull Requests ({githubTelemetry?.pull_requests?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "300px", overflowY: "auto" }}>
                {(!githubTelemetry?.pull_requests || githubTelemetry.pull_requests.length === 0) ? (
                  <p style={{ fontSize: "12px", color: "#7a6f67", fontStyle: "italic" }}>No pull requests recorded yet.</p>
                ) : (
                  githubTelemetry.pull_requests.map((pr: any) => (
                    <div key={pr.id || pr.number} style={{ background: "#ffffff", padding: "10px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1a1410" }}>
                          PR #{pr.number}: {pr.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#7a6f67" }}>
                          Author: {pr.github_actor_login || "Student"}
                        </div>
                      </div>
                      <Badge style={{ background: pr.merged ? "#00a19b" : "#1a1410", color: "#ffffff", fontSize: "10px" }}>
                        {pr.merged ? "MERGED ✓" : pr.state}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* TAB 4: VERIFIED PROOF & EVIDENCE */}
      {activeTab === "evidence" && (
        <section>
          <Card style={{ background: "#eee8df", border: "1px solid rgba(0,0,0,0.1)" }}>
            <CardHeader>
              <CardTitle style={{ color: "#1a1410" }}>🏆 Verified Engineering Proof & Skill Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ fontSize: "14px", color: "#7a6f67", marginBottom: "16px" }}>
                Verified evidence is generated ONLY when observable, attributable engineering execution occurs (e.g. verified merged PRs mapped to your student profile).
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#00a19b" }}>
                    {githubTelemetry?.verified_evidence_count || 0}
                  </div>
                  <div style={{ fontSize: "12px", color: "#7a6f67", fontWeight: "bold", marginTop: "4px" }}>
                    VERIFIED SKILL EVIDENCE RECORDS
                  </div>
                </div>

                <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1a1410" }}>
                    {githubTelemetry?.pull_requests?.filter((p: any) => p.merged).length || 0}
                  </div>
                  <div style={{ fontSize: "12px", color: "#7a6f67", fontWeight: "bold", marginTop: "4px" }}>
                    MERGED PULL REQUESTS
                  </div>
                </div>

                <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", textAlign: "center" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1a1410" }}>
                    {kanban.done?.length || 0}
                  </div>
                  <div style={{ fontSize: "12px", color: "#7a6f67", fontWeight: "bold", marginTop: "4px" }}>
                    COMPLETED TASKS
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* GOOGLE MEET LINK MODAL */}
      {showMeetingModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#f7f2eb",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1410", margin: "0 0 12px 0" }}>
              📹 Configure Google Meeting Link
            </h3>
            <form onSubmit={handleSaveMeeting} style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#1a1410" }}>
                  Google Meet URL
                </label>
                <Input
                  value={meetingUrlInput}
                  onChange={(e) => setMeetingUrlInput(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  required
                  style={{ background: "#ffffff" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <Button variant="outline" type="button" onClick={() => setShowMeetingModal(false)}>
                  Cancel
                </Button>
                <Button style={{ background: "#00a19b", color: "#ffffff" }} type="submit" disabled={updatingMeeting}>
                  {updatingMeeting ? "Saving..." : "Save Meeting Link"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GITHUB REPOSITORY LINK MODAL */}
      {showGithubModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#f7f2eb",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1410", margin: "0 0 12px 0" }}>
              🐙 Link GitHub Repository
            </h3>
            <form onSubmit={handleLinkRepository} style={{ display: "grid", gap: "14px" }}>
              {userRepos.length > 0 ? (
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#1a1410" }}>
                    Select Repository
                  </label>
                  <select
                    value={selectedRepoFull}
                    onChange={(e) => setSelectedRepoFull(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid rgba(0, 0, 0, 0.16)",
                      background: "#ffffff",
                      fontSize: "14px",
                    }}
                    required
                  >
                    <option value="">-- Choose Repository --</option>
                    {userRepos.map((r: any) => (
                      <option key={r.id || r.full_name} value={r.full_name}>
                        {r.full_name} {r.private ? "(Private)" : "(Public)"}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#1a1410" }}>
                    Repository Full Name (owner/repo)
                  </label>
                  <Input
                    value={selectedRepoFull}
                    onChange={(e) => setSelectedRepoFull(e.target.value)}
                    placeholder="student/my-project"
                    required
                    style={{ background: "#ffffff" }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <Button variant="outline" type="button" onClick={() => setShowGithubModal(false)}>
                  Cancel
                </Button>
                <Button style={{ background: "#00a19b", color: "#ffffff" }} type="submit" disabled={linkingRepo}>
                  {linkingRepo ? "Linking..." : "Link Repository"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SPRINT MODAL */}
      {showSprintModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#f7f2eb", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "500px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1410", margin: "0 0 14px 0" }}>🚀 Create New Execution Sprint</h3>
            <form onSubmit={handleCreateSprint} style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#1a1410" }}>Sprint Name</label>
                <Input value={sprintName} onChange={(e) => setSprintName(e.target.value)} placeholder="e.g. Sprint 1 — Authentication & DB Schema" required style={{ background: "#ffffff" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#1a1410" }}>Sprint Goal</label>
                <Input value={sprintGoal} onChange={(e) => setSprintGoal(e.target.value)} placeholder="e.g. Complete User Auth API and Alembic migrations" required style={{ background: "#ffffff" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#1a1410" }}>Start Date</label>
                  <Input type="date" value={sprintStartDate} onChange={(e) => setSprintStartDate(e.target.value)} required style={{ background: "#ffffff" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#1a1410" }}>End Date</label>
                  <Input type="date" value={sprintEndDate} onChange={(e) => setSprintEndDate(e.target.value)} required style={{ background: "#ffffff" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#1a1410" }}>Target Capacity (Hours)</label>
                <Input type="number" value={sprintCapacity} onChange={(e) => setSprintCapacity(Number(e.target.value))} required style={{ background: "#ffffff" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <Button variant="outline" type="button" onClick={() => setShowSprintModal(false)}>Cancel</Button>
                <Button style={{ background: "#00a19b", color: "#ffffff" }} type="submit" disabled={submittingSprint}>
                  {submittingSprint ? "Creating..." : "Create Sprint"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT BLOCKER MODAL */}
      {showBlockerModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#f7f2eb", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "480px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1410", margin: "0 0 14px 0" }}>⚠️ Report Task Blocker</h3>
            <form onSubmit={handleCreateBlocker} style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#1a1410" }}>Select Blocked Task</label>
                <select value={blockerTaskId} onChange={(e) => setBlockerTaskId(e.target.value)} required style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.16)", background: "#ffffff", fontSize: "14px" }}>
                  <option value="">-- Choose Task --</option>
                  {(dependencies?.nodes || []).map((t) => (
                    <option key={t.id} value={t.id}>{t.title} ({t.status})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#1a1410" }}>Blocker Reason / Impediment</label>
                <textarea rows={3} value={blockerReason} onChange={(e) => setBlockerReason(e.target.value)} placeholder="e.g. Waiting on database connection strings or missing third-party API keys" required style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.16)", background: "#ffffff", fontSize: "14px" }} />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <Button variant="outline" type="button" onClick={() => setShowBlockerModal(false)}>Cancel</Button>
                <Button style={{ background: "#dc2626", color: "#ffffff" }} type="submit" disabled={submittingBlocker}>
                  {submittingBlocker ? "Submitting..." : "Report Blocker"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK DEPENDENCY MODAL */}
      {showDepModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#f7f2eb", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "480px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#1a1410", margin: "0 0 14px 0" }}>🔗 Link Task Dependency</h3>
            <form onSubmit={handleAddDependency} style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#1a1410" }}>Prerequisite Task (Blocks downstream)</label>
                <select value={depSourceTaskId} onChange={(e) => setDepSourceTaskId(e.target.value)} required style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.16)", background: "#ffffff", fontSize: "14px" }}>
                  <option value="">-- Choose Prerequisite Task --</option>
                  {(dependencies?.nodes || []).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#1a1410" }}>Dependent Task (Is blocked)</label>
                <select value={depTargetTaskId} onChange={(e) => setDepTargetTaskId(e.target.value)} required style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.16)", background: "#ffffff", fontSize: "14px" }}>
                  <option value="">-- Choose Dependent Task --</option>
                  {(dependencies?.nodes || []).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <Button variant="outline" type="button" onClick={() => setShowDepModal(false)}>Cancel</Button>
                <Button style={{ background: "#00a19b", color: "#ffffff" }} type="submit" disabled={submittingDep}>
                  {submittingDep ? "Adding..." : "Add Dependency Link"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
