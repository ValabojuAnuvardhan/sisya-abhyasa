export default function HomeTab({ setLoginStep, setActiveTab }) {
  return (
    <div>
      <div style={{ textAlign: "center", padding: "60px 0 50px" }}>
        <div className="tag" style={{ background: "rgba(0,161,155,0.12)", color: "#00A19B", marginBottom: 20, fontSize: 11 }}>
          Learn · Build · Collaborate · Prove
        </div>
        <h1 className="recoleta" style={{ fontSize: "clamp(42px, 6vw, 72px)", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 20 }}>
          Build experience before<br /><em style={{ color: "#00A19B" }}>you are asked to prove it.</em>
        </h1>
        <p className="proxima" style={{ fontSize: 17, color: "#7a6f67", maxWidth: 620, margin: "0 auto 36px", lineHeight: 1.7 }}>
          Discover a project or bring your own idea, learn what you need while building, collaborate with students, and turn real contributions into evidence of your skills.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="mint-btn" style={{ fontSize: 15, padding: "13px 32px" }} onClick={() => setLoginStep(true)}>Get Started Free →</button>
          <button className="ghost-btn" style={{ fontSize: 15, padding: "13px 32px" }} onClick={() => setActiveTab("solutions")}>Find a Project Idea</button>
        </div>
      </div>

      <div className="card" style={{ padding: 28, marginBottom: 36 }}>
        <div className="recoleta" style={{ fontSize: 24, marginBottom: 18 }}>How would you like to start?</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { icon: "✨", title: "Find me a project", desc: "Get a small set of realistic project ideas matched to your goals.", tab: "solutions" },
            { icon: "🛠️", title: "I have a project idea", desc: "Bring your idea and turn it into a structured project plan.", tab: "projects" },
            { icon: "🤝", title: "Explore projects to join", desc: "Discover community projects that are open to collaborators.", tab: "projects" },
          ].map(c => (
            <div key={c.title} className="card" style={{ padding: 22, cursor: "pointer" }} onClick={() => setActiveTab(c.tab)}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{c.icon}</div>
              <div className="recoleta" style={{ fontSize: 19, marginBottom: 8 }}>{c.title}</div>
              <p className="proxima" style={{ fontSize: 13, color: "#7a6f67", lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="proxima" style={{ textAlign: "center", color: "#9a8f87", fontSize: 12 }}>
        Prototype note: AI, GitHub evidence, and verification are not yet connected to the production backend.
      </p>
    </div>
  );
}
