import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
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

const DEFAULT_STATS = {
  name: "",
  year: "",
  avatar: "?",
  commits: 0,
  tasks: 0,
  skills: [],
  githubUsername: "",
};

function App() {
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      if (["home", "solutions", "projects", "progress", "skill_graph", "recruiter", "analytics"].includes(hash)) {
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
      if (["home", "solutions", "projects", "progress", "skill_graph", "recruiter", "analytics"].includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const [selectedProblem, setSelectedProblem] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginStep, setLoginStep] = useState(false);
  const [studentStats, setStudentStats] = useState(DEFAULT_STATS);

  // New state for Progress tab sections
  const [generatedRoadmaps, setGeneratedRoadmaps] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [, setCollaboratorProjects] = useState([]);

  // For re-viewing a saved roadmap from Progress tab
  const [viewingRoadmap, setViewingRoadmap] = useState(null);

  const generateRoadmap = async (problem) => {
    setSelectedProblem(problem);
    setRoadmapLoading(true);
    setRoadmap(null);

    const fallbackRoadmaps = {
      Climate: {
        tagline: "Build a real-time satellite & IoT satellite tracking dashboard to pinpoint plastic accumulation zones.",
        techStack: ["React", "Python (Flask)", "OpenLayers", "GeoJSON", "Tailwind CSS"],
        steps: [
          { week: "Week 1", title: "Problem Scoping & Data Sourcing", tasks: ["Source public marine debris dataset", "Define data ingestion schema"], resource: "NOAA Marine Debris Program" },
          { week: "Week 2", title: "GIS & Map Layer Setup", tasks: ["Initialize OpenLayers map component", "Plot plastic density heatmaps"], resource: "OpenLayers Docs" },
          { week: "Week 3", title: "Backend Ingestion API", tasks: ["Build REST endpoints for sensor payloads", "Store geospatial markers in PostGIS/MongoDB"], resource: "GeoJSON Spec" },
          { week: "Week 4", title: "Real-time Tracking Engine", tasks: ["Connect WebSockets for live ocean currents data", "Filter by region and severity"], resource: "Socket.io Guides" },
          { week: "Week 5", title: "Analytics & Export Tooling", tasks: ["Create cleanup route optimization reports", "Export PDF/CSV summaries for NGOs"], resource: "Chart.js Docs" },
          { week: "Week 6", title: "Deployment & Team Handoff", tasks: ["Deploy frontend to Vercel and API to Render", "Submit open-source project demo"], resource: "Vercel Docs" },
        ],
        outcome: "A production-grade ocean plastic tracking platform capable of displaying real-time GIS density layers and routing cleanup vessels."
      },
      Health: {
        tagline: "Develop an offline-first adaptive triage chatbot delivering accessible mental wellness resources.",
        techStack: ["React Native", "TensorFlow Lite", "Node.js", "Express", "SQLite"],
        steps: [
          { week: "Week 1", title: "Clinical Guidelines Review", tasks: ["Map core PHQ-9 & GAD-7 screening workflows", "Design privacy-focused data flow"], resource: "WHO Mental Health Guidelines" },
          { week: "Week 2", title: "UI Components & Accessibility", tasks: ["Design high-contrast calming interface", "Implement multilingual text switcher"], resource: "W3C Accessibility" },
          { week: "Week 3", title: "Local NLP Triage Engine", tasks: ["Integrate TFLite model for mood classification", "Set up fallback rule-based matching"], resource: "TensorFlow.js Docs" },
          { week: "Week 4", title: "Crisis SOS & Resource Routing", tasks: ["Implement localized hotline directory", "Build 1-tap encrypted emergency broadcast"], resource: "Twilio API Docs" },
          { week: "Week 5", title: "Progress Tracker & Journals", tasks: ["Build local encrypted SQLite mood logs", "Generate visual wellness trend graphs"], resource: "Chart.js Guides" },
          { week: "Week 6", title: "Security Audit & Beta Launch", tasks: ["Enforce zero-knowledge encryption on device", "Publish beta build to TestFlight"], resource: "App Store Guidelines" },
        ],
        outcome: "An accessible, privacy-respecting mental health triage app providing immediate guidance and crisis escalation."
      },
      Agriculture: {
        tagline: "Construct a predictive supply chain engine matching farm surplus directly to food banks.",
        techStack: ["Next.js", "Python (FastAPI)", "PostgreSQL", "Pandas", "Scikit-Learn"],
        steps: [
          { week: "Week 1", title: "Supply & Demand Modeling", tasks: ["Define crop shelf-life decline algorithms", "Design food bank intake schema"], resource: "USDA Food Loss Data" },
          { week: "Week 2", title: "Farmer Portal Interface", tasks: ["Create quick 3-step crop batch logging UI", "Implement photo upload and grading"], resource: "React Forms" },
          { week: "Week 3", title: "Matching Engine Backend", tasks: ["Write distance & perishability routing algorithm", "Integrate automated SMS notifications"], resource: "FastAPI Tutorials" },
          { week: "Week 4", title: "Logistics Dashboard", tasks: ["Build interactive driver map and route list", "Track pickup confirmation status"], resource: "Mapbox GL JS" },
          { week: "Week 5", title: "Metrics & Impact Reports", tasks: ["Calculate meals saved and carbon offset", "Generate donor impact scorecards"], resource: "Recharts Library" },
          { week: "Week 6", title: "Pilot Launch & Field Test", tasks: ["Test with mock local farm data", "Deploy full stack application"], resource: "Railway / Render" },
        ],
        outcome: "A smart agricultural dispatch platform preventing food wastage through dynamic AI supply-demand matching."
      }
    };

    const defaultFallback = {
      tagline: `Build an end-to-end, high-impact solution addressing ${problem.title}.`,
      techStack: ["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
      steps: [
        { week: "Week 1", title: "Requirements & Architecture", tasks: ["Define user personas and core features", "Design DB schema and API architecture"], resource: "System Design Primer" },
        { week: "Week 2", title: "Frontend Skeleton", tasks: ["Set up UI design system and components", "Implement responsive navigation"], resource: "React Documentation" },
        { week: "Week 3", title: "Core Services & API", tasks: ["Build CRUD REST endpoints", "Connect database with connection pooling"], resource: "Node.js Best Practices" },
        { week: "Week 4", title: "AI Integration / Processing", tasks: ["Implement core algorithm / ML engine", "Connect async data processing workers"], resource: "Python FastAPI Docs" },
        { week: "Week 5", title: "Testing & User Feedback", tasks: ["Write integration unit tests", "Run usability review with peers"], resource: "Jest & React Testing Library" },
        { week: "Week 6", title: "Production Deployment", tasks: ["Set up CI/CD pipeline", "Deploy live MVP and publish proof of work"], resource: "Vercel / GitHub Actions" },
      ],
      outcome: `A fully functioning MVP solving ${problem.title} ready for real-world deployment.`
    };

    const prototypeRoadmap = fallbackRoadmaps[problem.domain] || defaultFallback;
    setRoadmap(prototypeRoadmap);
    saveRoadmapProgress(problem, prototypeRoadmap);
    setRoadmapLoading(false);
  };

  const saveRoadmapProgress = (problem, parsed) => {
    setGeneratedRoadmaps(prev => [
      {
        problem,
        roadmap: parsed,
        generatedAt: new Date().toISOString(),
        id: Date.now(),
      },
      ...prev,
    ]);
    setStudentStats(prev => ({
      ...prev,
      tasks: prev.tasks + 1,
    }));
  };

  const tabs = [
    { id: "home", label: "Home" },
    { id: "solutions", label: "Discover" },
    { id: "projects", label: "Projects" },
    { id: "progress", label: "Proof of Work" },
    { id: "skill_graph", label: "Skill Graph" },
    { id: "recruiter", label: "Recruiter View" },
    { id: "analytics", label: "Team Analytics" },
  ];

  return (
    <>
      <div className="grain" />

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        loggedIn={loggedIn}
        setLoginStep={setLoginStep}
        studentStats={studentStats}
      />

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

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px", position: "relative", zIndex: 1 }}>
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

      <Footer />
    </>
  );
}

export default App;

