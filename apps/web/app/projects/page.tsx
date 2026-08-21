"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProjects, createProject } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import PageBack from "@/components/PageBack";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [stack, setStack] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getUserId()) {
      router.push("/login");
      return;
    }
    getProjects()
      .then((res: any) => setProjects(Array.isArray(res) ? res : res.data || []))
      .catch((e: any) => setError(e.message));
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res: any = await createProject({
        title,
        tech_stack: stack.split(",").map((s) => s.trim()).filter(Boolean),
      });
      const newId = res.id || res.data?.id;
      router.push(`/projects/${newId}`);
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = (p.title || "").toLowerCase().includes(q);
    const stackMatch = (p.tech_stack || []).some((s: string) => s.toLowerCase().includes(q));
    return titleMatch || stackMatch;
  });

  return (
    <main className="shell formPage">
      <PageBack href="/dashboard" label="Back to Dashboard" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span className="tag">Project Workspace</span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", margin: "8px 0 4px" }}>Projects</h1>
          <p className="lead" style={{ margin: 0 }}>Create a new project or select an existing one to continue building.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {!showForm && (
            <Button variant="primary" onClick={() => setShowForm(true)}>
              + New Project
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "20px" }}>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search projects by title or tech stack (e.g., Python, React)..."
          style={{ background: "#ffffff", maxWidth: "480px" }}
        />
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <Card style={{ marginBottom: "28px" }}>
          <CardHeader>
            <CardTitle>Create a new project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  Project Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Resume Analyzer"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                  Tech Stack (comma-separated)
                </label>
                <Input
                  value={stack}
                  onChange={(e) => setStack(e.target.value)}
                  placeholder="e.g. Python, FastAPI, React, PostgreSQL"
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Project →"}
                </Button>
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {filteredProjects.length === 0 ? (
        <div className="notice" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ margin: "0 0 16px 0", color: "var(--muted)" }}>
            {searchQuery ? `No projects match "${searchQuery}".` : "No projects yet."}
          </p>
          <Button variant="primary" onClick={() => { setSearchQuery(""); setShowForm(true); }}>
            Create a new project →
          </Button>
        </div>
      ) : (
        <div className="grid">
          {filteredProjects.map((p: any) => (
            <Card
              key={p.id}
              onClick={() => router.push(`/projects/${p.id}`)}
              style={{ cursor: "pointer", transition: "transform 0.15s ease", height: "100%" }}
            >
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                  {(p.tech_stack || []).map((t: string) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
                {p.created_at && (
                  <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                    Created {new Date(p.created_at).toLocaleDateString()}
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
