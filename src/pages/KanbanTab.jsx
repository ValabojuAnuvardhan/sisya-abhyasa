import { useState } from "react";

export default function KanbanTab() {
  const [columns, setColumns] = useState([
    {
      id: "todo",
      title: "To Do",
      color: "#64748b",
      tasks: [
        { id: "t1", title: "Setup Docker PostgreSQL 17 Container", assignee: "Anu Vardhan", tag: "DevOps" },
        { id: "t2", title: "Write OpenAPI Schemas for Evidence Graph", assignee: "Anu Vardhan", tag: "Backend" },
      ]
    },
    {
      id: "in_progress",
      title: "In Progress",
      color: "#00a19b",
      tasks: [
        { id: "t3", title: "Ingest Sensor GeoJSON Stream", assignee: "Anu Vardhan", tag: "FastAPI" },
        { id: "t4", title: "Build React Telemetry Timeline View", assignee: "Priya S.", tag: "Frontend" },
      ]
    },
    {
      id: "done",
      title: "Done / Verified",
      color: "#10b981",
      tasks: [
        { id: "t5", title: "HMAC SHA-256 Webhook Verification", assignee: "Anu Vardhan", tag: "Security" },
        { id: "t6", title: "Dynamic Skill Graph Inferencing", assignee: "Anu Vardhan", tag: "AI Engine" },
      ]
    }
  ]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>Kanban Task Board</h1>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Track task progress and linked GitHub evidence commits.</p>
        </div>
        <button className="mint-btn">+ Add Task</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
        {columns.map((col) => (
          <div key={col.id} className="card" style={{ padding: 20, background: "#f8fafc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: col.color }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{col.title}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", background: "#ffffff", padding: "2px 8px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                {col.tasks.length}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {col.tasks.map((task) => (
                <div key={task.id} className="card" style={{ padding: 16, cursor: "grab" }}>
                  <span className="badge-public" style={{ marginBottom: 8, display: "inline-block" }}>{task.tag}</span>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>{task.title}</h4>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "#64748b" }}>
                    <span>👤 {task.assignee}</span>
                    <span style={{ color: "#00a19b", fontWeight: 600 }}>✓ Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
