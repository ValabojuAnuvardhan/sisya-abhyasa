import { problems, difficultyColor } from '../data/mockData';

export default function SolutionsTab({ generateRoadmap }) {
  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <div className="recoleta" style={{ fontSize: 40, marginBottom: 8 }}>Find a Project Idea</div>
        <p className="proxima" style={{ color: "#7a6f67", fontSize: 15, maxWidth: 720 }}>
          V1.1 Project Discovery prototype. Choose a realistic starting idea; personalized AI matching will be connected through the backend in a later sprint.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        {problems.map(p => (
          <div key={p.id} className="prob-card" onClick={() => generateRoadmap(p)}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{p.emoji}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
              <span className="tag" style={{ background: "rgba(0,0,0,0.06)", color: "#5a4f47" }}>{p.domain}</span>
              <span className="tag" style={{ background: `${difficultyColor[p.difficulty]}20`, color: difficultyColor[p.difficulty] }}>{p.difficulty}</span>
            </div>
            <div className="recoleta" style={{ fontSize: 20, marginBottom: 8 }}>{p.title}</div>
            <p className="proxima" style={{ fontSize: 13, color: "#7a6f67", lineHeight: 1.6, marginBottom: 14 }}>{p.description}</p>
            <span style={{ color: "#00A19B", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600 }}>Preview project plan →</span>
          </div>
        ))}
      </div>
    </div>
  );
}
