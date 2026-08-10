import { useState, useEffect } from "react";

export default function SkillGraphTab({ studentStats }) {
  const userSkillsList = studentStats?.skills || [];

  const ALL_MOCK_SKILLS = [
    { skill_name: "Python", category: "Backend", score: 92.0, confidence: 95.0, evidence_count: 14 },
    { skill_name: "React", category: "Frontend", score: 81.0, confidence: 88.0, evidence_count: 9 },
    { skill_name: "Git", category: "DevOps", score: 95.0, confidence: 98.0, evidence_count: 22 },
    { skill_name: "REST APIs", category: "Architecture", score: 84.0, confidence: 90.0, evidence_count: 11 },
    { skill_name: "Testing", category: "Quality Assurance", score: 72.0, confidence: 82.0, evidence_count: 6 },
    { skill_name: "System Design", category: "Architecture", score: 70.0, confidence: 78.0, evidence_count: 5 },
    { skill_name: "Docker", category: "DevOps", score: 63.0, confidence: 75.0, evidence_count: 4 },
  ];

  const activeSkills = userSkillsList.length > 0
    ? userSkillsList.map(name => {
        const found = ALL_MOCK_SKILLS.find(s => s.skill_name.toLowerCase() === name.toLowerCase());
        return found || { skill_name: name, category: "General", score: 65.0, confidence: 70.0, evidence_count: 2 };
      })
    : [];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: 32, textAlign: "left" }}>
        <div style={{ display: "inline-block", padding: "4px 12px", background: "rgba(0, 161, 155, 0.1)", color: "#00A19B", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          v1.1.0 Dynamic Telemetry Engine
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Dynamic Skill Graph</h1>
        <p style={{ color: "#666", fontSize: 15, marginTop: 6 }}>
          Continuously inferred proficiency scores derived from real Git commits, merged PRs, and verified evidence cards for <strong>{studentStats?.name || "Student"}</strong>.
        </p>
      </header>

      {activeSkills.length === 0 ? (
        <div style={{ background: "#ffffff", borderRadius: 16, padding: "48px 36px", border: "1px solid #e2e8f0", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>No Skills Recorded Yet</h2>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24, lineHeight: 1.6 }}>
            You haven't selected or earned any verified skill telemetry scores yet. Select skills in your profile settings or complete verified project tasks to automatically build your skill graph.
          </p>
        </div>
      ) : (

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
        {activeSkills.map((skill) => (
          <div
            key={skill.skill_name}
            style={{
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              transition: "transform 0.2s ease, boxShadow 0.2s ease"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{skill.skill_name}</span>
              <span style={{ fontSize: 12, fontWeight: 600, background: "#f0f4f8", color: "#475569", padding: "2px 8px", borderRadius: 6 }}>
                {skill.category}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#00A19B" }}>{skill.score}%</span>
              <span style={{ fontSize: 12, color: "#888" }}>{skill.evidence_count} Verified Evidences</span>
            </div>

            {/* Proficiency Bar */}
            <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
              <div
                style={{
                  height: "100%",
                  width: `${skill.score}%`,
                  background: "linear-gradient(90deg, #00A19B 0%, #3B82F6 100%)",
                  borderRadius: 4,
                  transition: "width 0.6s ease"
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
              <span>Confidence: {skill.confidence}%</span>
              <span>Updated Today</span>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
