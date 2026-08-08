export default function RoadmapModal({ selectedProblem, setSelectedProblem, roadmapLoading, roadmap, setRoadmap, setActiveTab }) {
  return (
    <div className="overlay" onClick={() => { setSelectedProblem(null); setRoadmap(null); }}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 36 }}>{selectedProblem.emoji}</span>
          <div>
            <div className="recoleta" style={{ fontSize: 26 }}>{selectedProblem.title}</div>
            <span className="tag" style={{ background: "rgba(0,161,155,0.1)", color: "#00A19B" }}>{selectedProblem.domain}</span>
          </div>
        </div>
        {roadmapLoading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ 
              width: 40, height: 40, 
              border: "3px solid #E4DDD3", borderTop: "3px solid #00A19B", 
              borderRadius: "50%", margin: "0 auto 16px", 
              animation: "spin 0.8s linear infinite" 
            }} />
            <p className="proxima" style={{ color: "#7a6f67", fontSize: 14 }}>Preparing the prototype project plan...</p>
          </div>
        )}
        {roadmap && !roadmap.error && (
          <div>
            <p className="proxima" style={{ fontSize: 15, color: "#4a3f37", fontStyle: "italic", marginBottom: 24, lineHeight: 1.6 }}>"{roadmap.tagline}"</p>
            <div style={{ marginBottom: 20 }}>
              <div className="proxima" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#9a8f87", marginBottom: 10, textTransform: "uppercase" }}>Tech Stack</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {roadmap.techStack?.map(t => (
                  <span key={t} className="tag" style={{ background: "rgba(0,161,155,0.1)", color: "#00A19B", fontSize: 12 }}>{t}</span>
                ))}
              </div>
            </div>
            <div className="proxima" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#9a8f87", marginBottom: 12, textTransform: "uppercase" }}>Prototype Project Plan</div>
            {roadmap.steps?.map((step, i) => (
              <div key={i} className="step-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className="proxima" style={{ fontSize: 13, fontWeight: 700, color: "#00A19B" }}>{step.week}</span>
                  <span className="proxima" style={{ fontSize: 11, color: "#9a8f87" }}>{step.resource}</span>
                </div>
                <div className="recoleta" style={{ fontSize: 17, marginBottom: 8 }}>{step.title}</div>
                {step.tasks?.map((task, j) => (
                  <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
                    <span style={{ color: "#00A19B", fontSize: 12, marginTop: 2 }}>▸</span>
                    <span className="proxima" style={{ fontSize: 13, color: "#4a3f37" }}>{task}</span>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ background: "rgba(0,161,155,0.08)", borderRadius: 14, padding: "16px 20px", marginTop: 16 }}>
              <div className="proxima" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#00A19B", marginBottom: 6, textTransform: "uppercase" }}>What You'll Build</div>
              <p className="proxima" style={{ fontSize: 13, color: "#4a3f37", lineHeight: 1.6 }}>{roadmap.outcome}</p>
            </div>
            <button className="mint-btn" style={{ marginTop: 20, width: "100%" }} onClick={() => { setSelectedProblem(null); setRoadmap(null); setActiveTab("projects"); }}>
              Start This Project →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
