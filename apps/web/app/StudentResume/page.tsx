"use client";

import { useState } from "react";

interface Project {
  id: number;
  title: string;
  description: string;
  tech: string;
  link: string;
}

interface Experience {
  id: number;
  company: string;
  role: string;
  period: string;
  description: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  period: string;
  details: string;
}

interface Skill {
  id: number;
  name: string;
  level: string;
}

const templates = [
  { id: "classic", name: "Classic ATS", type: "Free", price: 0, description: "Clean and recruiter-friendly layout" },
  { id: "modern", name: "Modern Portfolio", type: "Premium", price: 12, description: "Profile-focused with project highlights" },
  { id: "minimal", name: "Minimal Pro", type: "Premium", price: 15, description: "Simple and elegant design" },
  { id: "executive", name: "Executive Edge", type: "Premium", price: 18, description: "Strong for leadership roles" },
];

export default function StudentResumePage() {
  const [downloadsRemaining, setDownloadsRemaining] = useState(1);
  const [activeTab, setActiveTab] = useState<"portfolio" | "resume">("portfolio");
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [generatedSummary, setGeneratedSummary] = useState("");

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: "CampusConnect",
      description: "A student networking platform for clubs, events and peer collaboration.",
      tech: "Next.js, TypeScript, PostgreSQL, Tailwind",
      link: "https://github.com/student/campusconnect",
    },
  ]);

  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: 1,
      company: "CodeCraft Labs",
      role: "Frontend Engineer Intern",
      period: "2024 - Present",
      description: "Improved conversion by 18% through A/B testing and building reusable UI components.",
    },
  ]);

  const [educations, setEducations] = useState<Education[]>([
    {
      id: 1,
      school: "University of Technology",
      degree: "B.Sc. in Computer Science",
      period: "2021 - 2025",
      details: "Graduated with distinction. Active member of the product club.",
    },
  ]);

  const [skills, setSkills] = useState<Skill[]>([
    { id: 1, name: "Next.js", level: "Advanced" },
    { id: 2, name: "TypeScript", level: "Advanced" },
    { id: 3, name: "UI/UX", level: "Intermediate" },
  ]);

  const handleDownload = () => {
    if (downloadsRemaining > 0) {
      setDownloadsRemaining(downloadsRemaining - 1);
      alert("PDF download started! (Placeholder for now)");
    } else {
      alert("No free downloads left this month. Please upgrade to continue.");
    }
  };

  const handleGenerateResume = () => {
    const template = templates.find((t) => t.id === selectedTemplate);
    setGeneratedSummary(
      `ATS-friendly resume generated using "${template?.name}" template.\n\n` +
      `• Highlighted ${projects.length} project(s)\n` +
      `• Included ${experiences.length} experience(s)\n` +
      `• Skills: ${skills.map((s) => s.name).join(", ")}\n\n` +
      `This is a placeholder. Later we will connect it to a real AI backend.`
    );
  };

  // Update helpers
  const updateProject = (id: number, field: keyof Project, value: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };
  const addProject = () => {
    const newId = projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
    setProjects([...projects, { id: newId, title: "", description: "", tech: "", link: "" }]);
  };

  const updateExperience = (id: number, field: keyof Experience, value: string) => {
    setExperiences((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };
  const addExperience = () => {
    const newId = experiences.length > 0 ? Math.max(...experiences.map((e) => e.id)) + 1 : 1;
    setExperiences([...experiences, { id: newId, company: "", role: "", period: "", description: "" }]);
  };

  const updateEducation = (id: number, field: keyof Education, value: string) => {
    setEducations((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };
  const addEducation = () => {
    const newId = educations.length > 0 ? Math.max(...educations.map((e) => e.id)) + 1 : 1;
    setEducations([...educations, { id: newId, school: "", degree: "", period: "", details: "" }]);
  };

  const updateSkill = (id: number, field: keyof Skill, value: string) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };
  const addSkill = () => {
    const newId = skills.length > 0 ? Math.max(...skills.map((s) => s.id)) + 1 : 1;
    setSkills([...skills, { id: newId, name: "", level: "Intermediate" }]);
  };

  return (
    <div className="shell" style={{ paddingTop: "40px", paddingBottom: "80px" }}>
      <div className="pageBackWrapper">
        <a href="/dashboard" className="pageBackLink">← Back to Dashboard</a>
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "42px", margin: "0 0 8px 0" }}>
            Student Resume & Portfolio
          </h1>
          <p className="lead" style={{ margin: 0 }}>
            Build your proof of work and generate an ATS-friendly resume anytime.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="status">
            {downloadsRemaining} free download{downloadsRemaining !== 1 ? "s" : ""} left
          </span>
          <button className="btn primary" onClick={handleDownload} disabled={downloadsRemaining === 0}>
            Download PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginTop: "36px", display: "flex", gap: "12px" }}>
        <button className={`btn ${activeTab === "portfolio" ? "primary" : "secondary"}`} onClick={() => setActiveTab("portfolio")}>
          Portfolio Builder
        </button>
        <button className={`btn ${activeTab === "resume" ? "primary" : "secondary"}`} onClick={() => setActiveTab("resume")}>
          AI Resume Agent
        </button>
      </div>

      {/* PORTFOLIO TAB */}
      {activeTab === "portfolio" && (
        <div style={{ marginTop: "32px", display: "grid", gap: "28px" }}>
          {/* Projects */}
          <Section title="Projects" onAdd={addProject}>
            {projects.map((p) => (
              <Card key={p.id}>
                <input value={p.title} onChange={(e) => updateProject(p.id, "title", e.target.value)} placeholder="Project Title" style={inputStyle} />
                <textarea value={p.description} onChange={(e) => updateProject(p.id, "description", e.target.value)} placeholder="Description" rows={3} style={textareaStyle} />
                <input value={p.tech} onChange={(e) => updateProject(p.id, "tech", e.target.value)} placeholder="Tech Stack" style={inputStyle} />
                <input value={p.link} onChange={(e) => updateProject(p.id, "link", e.target.value)} placeholder="Project Link" style={inputStyle} />
              </Card>
            ))}
          </Section>

          {/* Experience */}
          <Section title="Experience" onAdd={addExperience}>
            {experiences.map((e) => (
              <Card key={e.id}>
                <input value={e.company} onChange={(ev) => updateExperience(e.id, "company", ev.target.value)} placeholder="Company" style={inputStyle} />
                <input value={e.role} onChange={(ev) => updateExperience(e.id, "role", ev.target.value)} placeholder="Role" style={inputStyle} />
                <input value={e.period} onChange={(ev) => updateExperience(e.id, "period", ev.target.value)} placeholder="Period" style={inputStyle} />
                <textarea value={e.description} onChange={(ev) => updateExperience(e.id, "description", ev.target.value)} placeholder="Achievements" rows={3} style={textareaStyle} />
              </Card>
            ))}
          </Section>

          {/* Education */}
          <Section title="Education" onAdd={addEducation}>
            {educations.map((e) => (
              <Card key={e.id}>
                <input value={e.school} onChange={(ev) => updateEducation(e.id, "school", ev.target.value)} placeholder="School" style={inputStyle} />
                <input value={e.degree} onChange={(ev) => updateEducation(e.id, "degree", ev.target.value)} placeholder="Degree" style={inputStyle} />
                <input value={e.period} onChange={(ev) => updateEducation(e.id, "period", ev.target.value)} placeholder="Period" style={inputStyle} />
                <textarea value={e.details} onChange={(ev) => updateEducation(e.id, "details", ev.target.value)} placeholder="Details" rows={2} style={textareaStyle} />
              </Card>
            ))}
          </Section>

          {/* Skills */}
          <Section title="Skills" onAdd={addSkill}>
            {skills.map((s) => (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: "12px", marginBottom: "12px" }}>
                <input value={s.name} onChange={(e) => updateSkill(s.id, "name", e.target.value)} placeholder="Skill" style={inputStyle} />
                <select value={s.level} onChange={(e) => updateSkill(s.id, "level", e.target.value)} style={inputStyle}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
              </div>
            ))}
          </Section>
        </div>
      )}

      {/* RESUME TAB */}
      {activeTab === "resume" && (
        <div style={{ marginTop: "32px", display: "grid", gap: "24px" }}>
          <div className="formCard">
            <h2 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>Choose a Template</h2>
            <div style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  style={{
                    border: selectedTemplate === template.id ? "2px solid var(--mint)" : "1px solid var(--card-border)",
                    borderRadius: "14px",
                    padding: "16px",
                    cursor: "pointer",
                    background: selectedTemplate === template.id ? "rgba(0,161,155,0.06)" : "rgba(255,255,255,0.5)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>{template.name}</strong>
                      <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "14px" }}>{template.description}</p>
                    </div>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 600,
                      background: template.type === "Free" ? "rgba(0,161,155,0.15)" : "rgba(0,0,0,0.08)",
                      color: template.type === "Free" ? "var(--mint)" : "var(--muted)",
                    }}>
                      {template.type === "Free" ? "Free" : `$${template.price}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn primary" style={{ marginTop: "24px" }} onClick={handleGenerateResume}>
              Generate ATS Resume
            </button>
          </div>

          {generatedSummary && (
            <div className="formCard">
              <h2 style={{ fontFamily: "Georgia, serif", marginTop: 0 }}>Generated Resume Preview</h2>
              <pre style={{ whiteSpace: "pre-wrap", color: "var(--ink)", lineHeight: 1.6 }}>{generatedSummary}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Small helper components
function Section({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <div className="formCard">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontFamily: "Georgia, serif", margin: 0 }}>{title}</h2>
        <button className="btn secondary" onClick={onAdd}>+ Add {title.slice(0, -1)}</button>
      </div>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--card-border)", borderRadius: "14px", padding: "20px", marginBottom: "16px", background: "rgba(255,255,255,0.5)" }}>
      <div style={{ display: "grid", gap: "14px" }}>{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "999px",
  border: "1px solid rgba(0,0,0,0.16)",
  background: "#f7f2eb",
  font: "inherit",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.16)",
  background: "#f7f2eb",
  font: "inherit",
  resize: "vertical",
};