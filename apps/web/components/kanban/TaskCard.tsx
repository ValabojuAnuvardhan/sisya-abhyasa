"use client";

import { useState } from "react";
import { askAbhyasBotTask, moveTask } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const STATUS_OPTIONS = ["todo", "in_progress", "in_review", "done"];

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

interface Props {
  task: any;
  projectId: string;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

export function TaskCard({ task, projectId, onStatusChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [botOpen, setBotOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [advisory, setAdvisory] = useState("");
  const [botLoading, setBotLoading] = useState(false);
  const [moving, setMoving] = useState(false);

  const currentStatus = task.status === "review" ? "in_review" : task.status;

  async function handleMove(newStatus: string) {
    if (newStatus === currentStatus || moving) return;
    setMoving(true);
    try {
      await moveTask(task.id, newStatus);
      onStatusChange(task.id, newStatus);
    } catch (err: any) {
      console.error("Failed to move task:", err);
    } finally {
      setMoving(false);
    }
  }

  async function askBot() {
    if (!question.trim() || botLoading) return;
    setBotLoading(true);
    try {
      const res = await askAbhyasBotTask(question, task.id, projectId);
      setAnswer(res.answer);
      if (res.advisory) {
        setAdvisory(res.advisory);
      }
    } catch {
      setAnswer("Could not connect to AbhyāsBot. Please try again.");
    } finally {
      setBotLoading(false);
    }
  }

  const statusBadgeVariant = (s: string) => {
    switch (s) {
      case "done":
        return "success";
      case "in_progress":
        return "default";
      case "in_review":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div
      className="task-card"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: "12px",
        padding: "14px",
        marginBottom: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        transition: "all 0.15s ease",
      }}
    >
      {/* Header: Title & Expand Toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
        <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--ink)", lineHeight: "1.4" }}>
          {task.title}
        </h4>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "11px",
            color: "var(--muted)",
            padding: "2px 4px",
          }}
          title={expanded ? "Collapse details" : "Expand details"}
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {/* Status Badge */}
      <div style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Badge variant={statusBadgeVariant(currentStatus)}>
          {STATUS_LABELS[currentStatus] || currentStatus}
        </Badge>
        {task.required_skills && task.required_skills.length > 0 && (
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            {task.required_skills.slice(0, 2).join(", ")}
          </span>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(0, 0, 0, 0.08)", fontSize: "13px" }}>
          {task.description && (
            <p style={{ margin: "0 0 8px 0", color: "var(--muted)", lineHeight: "1.45" }}>
              {task.description}
            </p>
          )}

          {task.completion_criteria && (
            <div style={{ background: "rgba(0, 161, 155, 0.06)", padding: "8px 10px", borderRadius: "6px", marginBottom: "10px" }}>
              <strong style={{ fontSize: "12px", color: "var(--mint)" }}>Done when:</strong>{" "}
              <span style={{ color: "var(--ink)", fontSize: "12px" }}>{task.completion_criteria}</span>
            </div>
          )}

          {/* Move task controls */}
          <div style={{ marginTop: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: "6px" }}>
              Move to:
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {STATUS_OPTIONS.filter((s) => s !== currentStatus).map((s) => (
                <button
                  key={s}
                  onClick={() => handleMove(s)}
                  disabled={moving}
                  style={{
                    fontSize: "11px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0, 0, 0, 0.12)",
                    background: "#f9f8f6",
                    color: "var(--ink)",
                    cursor: moving ? "not-allowed" : "pointer",
                    opacity: moving ? 0.5 : 1,
                  }}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inline AbhyāsBot Drawer */}
      <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px dashed rgba(0, 0, 0, 0.08)" }}>
        {!botOpen ? (
          <button
            onClick={() => setBotOpen(true)}
            style={{
              width: "100%",
              fontSize: "12px",
              padding: "6px 10px",
              borderRadius: "8px",
              border: "1px solid rgba(124, 58, 237, 0.25)",
              background: "rgba(124, 58, 237, 0.04)",
              color: "#6d28d9",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <span>⚒️</span> Ask AbhyāsBot about this task
          </button>
        ) : (
          <div
            style={{
              background: "rgba(124, 58, 237, 0.03)",
              border: "1px solid rgba(124, 58, 237, 0.2)",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "bold", color: "#6d28d9", display: "flex", alignItems: "center", gap: "4px" }}>
                ⚒️ AbhyāsBot
              </span>
              <button
                onClick={() => setBotOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How should I implement this step?"
              style={{ fontSize: "12px", minHeight: "60px", marginBottom: "8px" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
              <Button
                variant="primary"
                size="sm"
                onClick={askBot}
                disabled={botLoading || !question.trim()}
                style={{ background: "#6d28d9", borderColor: "#6d28d9", fontSize: "11px" }}
              >
                {botLoading ? "Thinking..." : "Ask Bot →"}
              </Button>
            </div>

            {answer && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#ffffff",
                  border: "1px solid rgba(124, 58, 237, 0.15)",
                  fontSize: "12px",
                  color: "var(--ink)",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                }}
              >
                <div style={{ fontWeight: 600, color: "#6d28d9", marginBottom: "4px" }}>Guidance:</div>
                {answer}
                {advisory && (
                  <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px", fontStyle: "italic" }}>
                    ℹ️ {advisory}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
