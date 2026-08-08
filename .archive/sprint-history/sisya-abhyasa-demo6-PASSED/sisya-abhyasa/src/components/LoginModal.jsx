import { useState } from 'react';

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Postgraduate"];
const SKILL_OPTIONS = ["React", "Python", "Node.js", "Flutter", "Java", "C++", "ML/AI", "DevOps", "UI/UX", "Blockchain", "Data Science", "Go"];
const CAREER_TARGET_OPTIONS = ["AI / ML Engineer", "Fullstack Web Developer", "DevOps & Cloud Engineer", "Mobile App Developer"];

function getInitials(name) {
  return name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function LoginModal({ setLoginStep, setLoggedIn, setStudentStats }) {
  const [step, setStep] = useState(1); // 1 = credentials, 2 = profile setup, 3 = github
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [targetCareer, setTargetCareer] = useState("AI / ML Engineer");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [githubUsername, setGithubUsername] = useState("");

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
    }
    setSkillInput("");
  };

  const handleCredentialContinue = (e) => {
    if (e) e.preventDefault();
    setStep(2);
  };

  const handleQuickDemoLogin = () => {
    setStudentStats({
      name: "Anu Vardhan",
      year: "3rd Year · CSE",
      avatar: "AV",
      targetCareer: "AI / ML Engineer",
      commits: 12,
      tasks: 3,
      badge: "Core Builder ⚡",
      skills: ["React", "Python", "FastAPI", "ML/AI"],
      githubUsername: "valabojuanuvardhan",
    });
    setLoggedIn(true);
    setLoginStep(false);
  };

  const handleProfileContinue = () => {
    if (!name.trim()) setName("Student Builder");
    if (!year) setYear("3rd Year");
    setStep(3);
  };

  const handleProfileComplete = () => {
    const finalName = name.trim() || "Student Builder";
    const finalYear = year || "3rd Year";
    const initials = getInitials(finalName);
    setStudentStats({
      name: finalName,
      year: `${finalYear} · ${branch || "CS"}`,
      avatar: initials,
      targetCareer: targetCareer || "AI / ML Engineer",
      commits: 2,
      tasks: 1,
      badge: "Active Hacker 🔥",
      skills: selectedSkills.length > 0 ? selectedSkills : ["React", "Python"],
      githubUsername: githubUsername.trim().replace(/^@/, ""),
    });
    setLoggedIn(true);
    setLoginStep(false);
  };

  return (
    <div className="overlay" onClick={() => setLoginStep(false)}>
      <div className="login-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>

        {/* Step Indicators */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 4,
              background: step >= s ? "#00A19B" : "rgba(0,0,0,0.1)",
              transition: "background 0.3s"
            }} />
          ))}
        </div>

        {/* Step 1 — Credentials */}
        {step === 1 && (
          <form onSubmit={handleCredentialContinue}>
            <div className="recoleta" style={{ fontSize: 28, marginBottom: 6 }}>Welcome 👋</div>
            <p className="proxima" style={{ fontSize: 13, color: "#7a6f67", marginBottom: 20 }}>
              Your Śiṣya Abhyāsa journey starts here.
            </p>

            <button
              type="button"
              className="mint-btn"
              style={{
                width: "100%", padding: "14px", fontSize: 14, marginBottom: 20,
                background: "linear-gradient(135deg, #00A19B 0%, #007A76 100%)",
                boxShadow: "0 4px 14px rgba(0,161,155,0.3)"
              }}
              onClick={handleQuickDemoLogin}
            >
              ⚡ Quick Demo Login (1-Tap)
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0", color: "#9a8f87" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
              <span className="proxima" style={{ fontSize: 11 }}>OR ENTER DETAILS</span>
              <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.1)" }} />
            </div>

            <input
              className="input"
              type="email"
              placeholder="Email address (e.g. student@college.edu)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ marginBottom: 20 }}
            />
            <button
              type="submit"
              className="ghost-btn"
              style={{ width: "100%", padding: "12px", fontSize: 14 }}
            >
              Continue with Email →
            </button>
          </form>
        )}

        {/* Step 2 — Profile */}
        {step === 2 && (
          <>
            <div className="recoleta" style={{ fontSize: 26, marginBottom: 6 }}>Set up your profile 🎓</div>
            <p className="proxima" style={{ fontSize: 13, color: "#7a6f67", marginBottom: 24 }}>
              Tell us about yourself so we can personalise your experience.
            </p>

            {/* Full Name */}
            <label className="proxima" style={{ fontSize: 12, fontWeight: 600, color: "#5a4f47", display: "block", marginBottom: 6 }}>
              Full Name *
            </label>
            <input
              className="input"
              placeholder="e.g. Anu Vardhan"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            {/* Year */}
            <label className="proxima" style={{ fontSize: 12, fontWeight: 600, color: "#5a4f47", display: "block", marginBottom: 6 }}>
              Year of Study *
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {YEAR_OPTIONS.map(y => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={year === y ? "mint-btn" : "ghost-btn"}
                  style={{ fontSize: 12, padding: "6px 14px" }}
                >
                  {y}
                </button>
              ))}
            </div>

            {/* Branch */}
            <label className="proxima" style={{ fontSize: 12, fontWeight: 600, color: "#5a4f47", display: "block", marginBottom: 6 }}>
              Branch / Department
            </label>
            <input
              className="input"
              placeholder="e.g. CSE, ECE, Mechanical..."
              value={branch}
              onChange={e => setBranch(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            {/* Desired Career Target */}
            <label className="proxima" style={{ fontSize: 12, fontWeight: 600, color: "#00A19B", display: "block", marginBottom: 6 }}>
              🎯 Target Career Role (Powers AI Skill-Gap Agent)
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {CAREER_TARGET_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setTargetCareer(c)}
                  className={targetCareer === c ? "mint-btn" : "ghost-btn"}
                  style={{ fontSize: 11, padding: "5px 12px" }}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Skills */}
            <label className="proxima" style={{ fontSize: 12, fontWeight: 600, color: "#5a4f47", display: "block", marginBottom: 6 }}>
              Your Skills (pick all that apply)
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {SKILL_OPTIONS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={selectedSkills.includes(skill) ? "mint-btn" : "ghost-btn"}
                  style={{ fontSize: 11, padding: "5px 12px" }}
                >
                  {skill}
                </button>
              ))}
            </div>

            {/* Custom skill input */}
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              <input
                className="input"
                placeholder="Add custom skill..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustomSkill()}
                style={{ flex: 1 }}
              />
              <button className="ghost-btn" style={{ fontSize: 12, padding: "8px 14px", flexShrink: 0 }} onClick={addCustomSkill}>
                + Add
              </button>
            </div>

            <button
              className="mint-btn"
              style={{ width: "100%", padding: "13px", fontSize: 14 }}
              onClick={handleProfileContinue}
            >
              Next →
            </button>
            <button
              className="proxima"
              style={{ background: "none", border: "none", color: "#9a8f87", fontSize: 12, cursor: "pointer", marginTop: 12, display: "block", width: "100%", textAlign: "center" }}
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
          </>
        )}

        {/* Step 3 — GitHub */}
        {step === 3 && (
          <>
            <div className="recoleta" style={{ fontSize: 26, marginBottom: 6 }}>Connect GitHub 🐙</div>
            <p className="proxima" style={{ fontSize: 13, color: "#7a6f67", marginBottom: 24 }}>
              GitHub will later be used to capture evidence from repositories you explicitly connect. For this frontend prototype, adding a username is optional and does not verify contributions.
            </p>

            <label className="proxima" style={{ fontSize: 12, fontWeight: 600, color: "#5a4f47", display: "block", marginBottom: 6 }}>
              GitHub Username
            </label>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <span style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                color: "#9a8f87", fontFamily: "'DM Sans', sans-serif", fontSize: 14, pointerEvents: "none"
              }}>github.com/</span>
              <input
                className="input"
                placeholder="your-username"
                value={githubUsername}
                onChange={e => setGithubUsername(e.target.value)}
                style={{ paddingLeft: 96 }}
              />
            </div>

            {githubUsername.trim() && (
              <a
                href={`https://github.com/${githubUsername.trim().replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: "block", textAlign: "center", fontSize: 12, color: "#00A19B", fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}
              >
                ↗ Preview profile
              </a>
            )}

            <button
              className="mint-btn"
              style={{ width: "100%", padding: "13px", fontSize: 14 }}
              onClick={handleProfileComplete}
            >
              Start Building 🚀
            </button>
            <button
              className="proxima"
              style={{ background: "none", border: "none", color: "#9a8f87", fontSize: 12, cursor: "pointer", marginTop: 12, display: "block", width: "100%", textAlign: "center" }}
              onClick={handleProfileComplete}
            >
              Skip for now →
            </button>
            <button
              className="proxima"
              style={{ background: "none", border: "none", color: "#9a8f87", fontSize: 12, cursor: "pointer", marginTop: 6, display: "block", width: "100%", textAlign: "center" }}
              onClick={() => setStep(2)}
            >
              ← Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
