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

const DEFAULT_STATS = {
  name: "Anu Vardhan",
  year: "3rd Year · CSE",
  avatar: "AV",
  commits: 142,
  tasks: 24,
  skills: ["FastAPI", "Next.js", "PostgreSQL", "Git", "Docker"],
  githubUsername: "anuvardhan-v",
};

function App() {
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      if (["github", "home", "solutions", "projects", "progress", "skill_graph", "recruiter", "analytics"].includes(hash)) {
        return hash;
      }
    }
    return "github";
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
      if (["github", "home", "solutions", "projects", "progress", "skill_graph", "recruiter", "analytics"].includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const [selectedProblem, setSelectedProblem] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [loggedIn, setLoggedIn] = useState(true);
  const [loginStep, setLoginStep] = useState(false);
  const [studentStats, setStudentStats] = useState(DEFAULT_STATS);

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

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      <Navbar setLoginStep={setLoginStep} studentStats={studentStats} />

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
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ flex: 1, padding: "24px 32px", overflowX: "hidden" }}>
          {activeTab === "github" && <GitHubEvidenceTab />}
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
          {activeTab === "recruiter" && <RecruiterViewTab setActiveTab={setActiveTab} />}
          {activeTab === "analytics" && <TeamAnalyticsTab />}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default App;


