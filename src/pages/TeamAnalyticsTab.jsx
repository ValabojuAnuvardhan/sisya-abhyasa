import { useState } from "react";

export default function TeamAnalyticsTab() {
  const [analytics] = useState({
    collaborationScore: 92.5,
    participationRate: 88.0,
    heatmap: [
      { date: "Jul 28", commits: 12, prs: 3, reviews: 5 },
      { date: "Jul 29", commits: 18, prs: 4, reviews: 6 },
      { date: "Jul 30", commits: 24, prs: 5, reviews: 8 },
    ],
    members: [
      { name: "Anuvardhan Valaboju", tasks: 14, share: 45.0, status: "Active" },
      { name: "Collaborator 1", tasks: 9, share: 30.0, status: "Active" },
      { name: "Collaborator 2", tasks: 8, share: 25.0, status: "Active" },
    ]
  });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", background: "#eff6ff", padding: "4px 12px", borderRadius: 20 }}>
          Mentor Dashboard
        </span>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#111", margin: "8px 0 0 0" }}>Team Analytics & Risk Monitor</h1>
      </header>

      {/* Top Metrics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginBottom: 32 }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Team Collaboration Score</span>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#00A19B", marginTop: 4 }}>{analytics.collaborationScore}%</div>
          <p style={{ fontSize: 12, color: "#10b981", margin: "4px 0 0 0" }}>↑ 4.2% higher than sprint average</p>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>Participation Rate</span>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#2563eb", marginTop: 4 }}>{analytics.participationRate}%</div>
          <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0 0" }}>Zero inactive risk alerts detected</p>
        </div>
      </div>

      {/* Workload Table */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px 0", color: "#0f172a" }}>Member Workload & Participation</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>
              <th style={{ padding: "10px 0" }}>Member Name</th>
              <th>Tasks Completed</th>
              <th>Workload Share</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {analytics.members.map((m, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                <td style={{ padding: "12px 0", fontWeight: 600, color: "#1e293b" }}>{m.name}</td>
                <td>{m.tasks} tasks</td>
                <td>{m.share}%</td>
                <td><span style={{ color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>{m.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
