import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import RoadmapModal from "./components/RoadmapModal";
import HomeTab from "./pages/HomeTab";
import SolutionsTab from "./pages/SolutionsTab";
import ProjectsTab from "./pages/ProjectsTab";
import ProgressTab from "./pages/ProgressTab";
import SkillGraphTab from "./pages/SkillGraphTab";
import RecruiterViewTab from "./pages/RecruiterViewTab";
import TeamAnalyticsTab from "./pages/TeamAnalyticsTab";
import GitHubEvidenceTab from "./pages/GitHubEvidenceTab";
import KanbanTab from "./pages/KanbanTab";
import SettingsTab from "./pages/SettingsTab";

const DEFAULT_STATS = {
  name: "Student Builder",
  year: "3rd Year · CS",
  avatar: "SB",
  commits: 142,
  tasks: 24,
  skills: ["FastAPI", "Next.js", "PostgreSQL", "Git", "Docker"],
  githubUsername: "student-dev",
};

function App() {
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      if (["github", "home", "solutions", "projects", "progress", "skill_graph", "recruiter", "analytics", "kanban", "settings", "overview", "milestones"].includes(hash)) {
        return hash;
      }
    }
    return "home";
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["github", "home", "solutions", "projects", "progress", "skill_graph", "recruiter", "analytics", "kanban", "settings", "overview", "milestones"].includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const [selectedProblem, setSelectedProblem] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  
  const [loggedIn, setLoggedIn] = useState(() => {
    try {
      const saved = localStorage.getItem("sisya_user_session");
      return !!saved;
    } catch {
      return false;
    }
  });
  const [loginStep, setLoginStep] = useState(false);
  const [studentStats, setStudentStats] = useState(() => {
    try {
      const saved = localStorage.getItem("sisya_user_session");
      return saved ? JSON.parse(saved) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  const handleSignOut = () => {
    try {
      localStorage.removeItem("sisya_user_session");
    } catch (err) {
      console.warn("Could not clear localStorage session:", err);
    }
    setLoggedIn(false);
    setStudentStats(DEFAULT_STATS);
    setActiveTabState("home");
  };

  const [generatedRoadmaps, setGeneratedRoadmaps] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [, setCollaboratorProjects] = useState([]);
  const [viewingRoadmap, setViewingRoadmap] = useState(null);

  const generateRoadmap = async (problem) => {
    setSelectedProblem(problem);
    setRoadmapLoading(true);
    setRoadmap(null);
    setRoadmapLoading(false);
  };

  const handleNewItemCreated = (item) => {
    if (item.category === "project") {
      setMyProjects((prev) => [
        {
          id: `proj-${Date.now()}`,
          name: item.title,
          description: item.description,
          collaborationPitch: "Open to student collaborators!",
          skillsNeeded: ["React", "FastAPI"],
          teamCapacity: 4,
          discoverable: true,
          progress: 10,
          members: [{ id: "user-a", name: "Project Lead", role: "Owner" }],
          tasks: [],
        },
        ...prev,
      ]);
      setActiveTab("projects");
    } else if (item.category === "task") {
      setActiveTab("kanban");
    } else {
      setActiveTab("github");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      <Navbar setLoginStep={setLoginStep} studentStats={studentStats} loggedIn={loggedIn} onNewItemCreated={handleNewItemCreated} handleSignOut={handleSignOut} />

      {loginStep && (
        <LoginModal
          setLoginStep={setLoginStep}
          setLoggedIn={setLoggedIn}
          setStudentStats={setStudentStats}
        />
      )}

      {(selectedProblem || viewingRoadmap) && (
        <RoadmapModal
          selectedProblem={viewingRoadmap ? viewingRoadmap.problem : selectedProblem}
          setSelectedProblem={(val) => {
            setSelectedProblem(val);
            setViewingRoadmap(val);
          }}
          roadmapLoading={roadmapLoading}
          roadmap={viewingRoadmap ? viewingRoadmap.roadmap : roadmap}
          setRoadmap={setRoadmap}
          setActiveTab={setActiveTab}
        />
      )}

      {/* App Body with Sidebar + Main Workspace Content */}
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} loggedIn={loggedIn} setLoginStep={setLoginStep} />

        <main style={{ flex: 1, minWidth: 0, padding: "24px 32px", overflowX: "hidden" }}>
          {!loggedIn && ["projects", "github", "progress", "skill_graph", "kanban", "settings", "analytics", "recruiter"].includes(activeTab) ? (
            <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center", background: "#ffffff", borderRadius: 16, padding: "48px 36px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>Student Workspace Protected</h2>
              <p style={{ fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.6 }}>
                Please sign in with your student credentials or GitHub account to view your verified GitHub evidence, team space, tasks, and skill metrics.
              </p>
              <button onClick={() => setLoginStep(true)} className="mint-btn" style={{ padding: "12px 28px", fontSize: 14, fontWeight: 700 }}>
                Sign In / Sign Up →
              </button>
            </div>
          ) : (
            <>
              {activeTab === "github" && <GitHubEvidenceTab studentStats={studentStats} />}
              {activeTab === "home" && <HomeTab setLoginStep={setLoginStep} setActiveTab={setActiveTab} />}
              {activeTab === "solutions" && <SolutionsTab generateRoadmap={generateRoadmap} />}
              {activeTab === "projects" && (
                <ProjectsTab
                  loggedIn={loggedIn}
                  setLoginStep={setLoginStep}
                  studentStats={studentStats}
                  myProjects={myProjects}
                  setMyProjects={setMyProjects}
                  setCollaboratorProjects={setCollaboratorProjects}
                />
              )}
              {activeTab === "progress" && (
                <ProgressTab
                  loggedIn={loggedIn}
                  setLoginStep={setLoginStep}
                  studentStats={studentStats}
                  setStudentStats={setStudentStats}
                  generatedRoadmaps={generatedRoadmaps}
                  myProjects={myProjects}
                  setViewingRoadmap={setViewingRoadmap}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === "skill_graph" && <SkillGraphTab />}
              {activeTab === "recruiter" && <RecruiterViewTab setActiveTab={setActiveTab} studentStats={studentStats} />}
              {activeTab === "analytics" && <TeamAnalyticsTab studentStats={studentStats} />}
              {activeTab === "kanban" && <KanbanTab />}
              {activeTab === "settings" && <SettingsTab studentStats={studentStats} />}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;


