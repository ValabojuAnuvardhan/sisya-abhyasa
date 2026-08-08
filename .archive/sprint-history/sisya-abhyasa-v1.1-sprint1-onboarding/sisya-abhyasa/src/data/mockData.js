export const projectSources = [
  { id: "all", label: "All Projects" },
  { id: "Community", label: "👥 Community (Students)" },
  { id: "Academic", label: "🎓 Academic (Professors)" },
  { id: "Open Source", label: "🌐 Open Source (Maintainers)" },
  { id: "Company", label: "🏢 Company (Organizations)" },
];

export const problems = [
  { id: 1, emoji: "🌊", title: "Ocean Plastic Crisis", domain: "Climate", description: "8M tons of plastic enter oceans yearly. Real-time tracking and collection systems are critically needed.", difficulty: "Hard", contributors: 142, careerTarget: "Data / ML Engineer" },
  { id: 2, emoji: "🧠", title: "Mental Health Access Gap", domain: "Health", description: "1 in 4 people lack access to mental health support. AI-driven early detection can bridge the gap.", difficulty: "Medium", contributors: 89, careerTarget: "Fullstack / Mobile" },
  { id: 3, emoji: "🌾", title: "Food Waste at Scale", domain: "Agriculture", description: "1/3 of global food is wasted. Smart supply chain prediction can save billions of meals.", difficulty: "Medium", contributors: 67, careerTarget: "Backend / Cloud" },
  { id: 4, emoji: "📚", title: "Education Inequality", domain: "EdTech", description: "300M children lack quality education. Offline-first adaptive learning tools could change lives.", difficulty: "Easy", contributors: 203, careerTarget: "Frontend / EdTech" },
  { id: 5, emoji: "💧", title: "Clean Water Access", domain: "Infrastructure", description: "2B people lack safe drinking water. IoT-based detection + purification routing is viable.", difficulty: "Hard", contributors: 55, careerTarget: "IoT / Systems" },
  { id: 6, emoji: "🏙️", title: "Urban Traffic Gridlock", domain: "Smart City", description: "Cities lose $87B/year to traffic. AI-powered dynamic routing can reclaim millions of hours.", difficulty: "Medium", contributors: 118, careerTarget: "AI / GIS Specialist" },
];

export const projects = [
  { 
    name: "EcoRoute GIS", 
    source: "Community", 
    tags: ["React", "Python", "GIS"], 
    members: 4, 
    maxMembers: 6, 
    progress: 65, 
    owner: "Arjun S. (Student Lead)",
    openRoles: ["FastAPI Backend", "UI/UX Designer"],
    organization: "IIT Bombay Student Chapter"
  },
  { 
    name: "MindBridge AI Triage", 
    source: "Academic", 
    tags: ["Flutter", "TensorFlow", "SQLite"], 
    members: 3, 
    maxMembers: 5, 
    progress: 30, 
    owner: "Dr. R. Sharma (Professor)",
    openRoles: ["NLP Researcher", "React Native Dev"],
    organization: "AI in Healthcare Lab"
  },
  { 
    name: "HarvestAI Supply Chain", 
    source: "Company", 
    tags: ["Node.js", "PostgreSQL", "React"], 
    members: 5, 
    maxMembers: 5, 
    progress: 80, 
    owner: "AgriTech Solutions Ltd",
    openRoles: ["Full Team (Complete)"],
    organization: "AgriTech Industry Sponsor"
  },
  { 
    name: "Open-Edu Offline Engine", 
    source: "Open Source", 
    tags: ["TypeScript", "PWA", "IndexedDB"], 
    members: 2, 
    maxMembers: 4, 
    progress: 45, 
    owner: "Kiran V. (Maintainer)",
    openRoles: ["PWA Specialist", "Technical Writer"],
    organization: "EduFoundation OS"
  },
];

export const careerRoles = [
  { role: "AI / ML Engineer", missingSkills: ["Git / GitHub", "FastAPI", "Model Deployment", "PyTorch"], recommendedDifficulty: "Medium" },
  { role: "Fullstack Web Developer", missingSkills: ["React 19", "PostgreSQL", "Docker", "CI/CD"], recommendedDifficulty: "Easy" },
  { role: "DevOps & Cloud Engineer", missingSkills: ["Kubernetes", "Terraform", "GitHub Actions", "Monitoring"], recommendedDifficulty: "Hard" },
];

export const difficultyColor = { Easy: "#00A19B", Medium: "#c49a4a", Hard: "#b05050" };

