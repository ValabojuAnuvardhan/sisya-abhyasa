"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProjects, getProjectEvidence, getSkillEvidence, requestPrReview } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageBack from "@/components/PageBack";

export default function EvidencePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<Record<string, any[]>>({});
  const [skills, setSkills] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const uid = getUserId();
    if (!uid) {
      router.push("/login");
      return;
    }
    setUserId(uid);

    getProjects()
      .then(async (pRes: any) => {
        const projectList = Array.isArray(pRes) ? pRes : pRes.data || [];
        setProjects(projectList);
        const evidenceMap: Record<string, any[]> = {};
        await Promise.all(
          projectList.map(async (p: any) => {
            try {
              const eRes: any = await getProjectEvidence(p.id);
              evidenceMap[p.id] = Array.isArray(eRes) ? eRes : eRes.data || [];
            } catch {
              evidenceMap[p.id] = [];
            }
          })
        );
        setEvidence(evidenceMap);

        try {
          const skillRes: any = await getSkillEvidence(uid);
          setSkills(skillRes.data || skillRes);
        } catch {
          setSkills({ skills: [] });
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleReview(prId: string) {
    setReviewLoading(prId);
    try {
      const res: any = await requestPrReview(prId);
      const reviewData = res.data || res;
      setReviews((prev) => ({ ...prev, [prId]: reviewData }));

      // Refresh skills after AI review
      if (userId) {
        const updatedSkills: any = await getSkillEvidence(userId);
        setSkills(updatedSkills.data || updatedSkills);
      }
    } catch (err: any) {
      alert(err.message || "Review failed");
    } finally {
      setReviewLoading(null);
    }
  }

  const getConfidenceBadge = (confidence: number | string) => {
    const numConf = typeof confidence === "number" ? confidence : parseFloat(confidence) || 0.8;
    if (numConf >= 0.85) return <Badge variant="success">High ({Math.round(numConf * 100)}%)</Badge>;
    if (numConf >= 0.65) return <Badge variant="warning">Medium ({Math.round(numConf * 100)}%)</Badge>;
    return <Badge variant="secondary">Low ({Math.round(numConf * 100)}%)</Badge>;
  };

  if (loading) {
    return (
      <main className="shell formPage">
        <PageBack href="/dashboard" label="Back to Dashboard" />
        <p style={{ color: "var(--muted)" }}>Loading evidence & GitHub activity...</p>
      </main>
    );
  }

  const allRepoEntries = Object.values(evidence).flat();
  const totalCommits = allRepoEntries.reduce((s: number, repo: any) => s + (repo.commits?.length ?? 0), 0);
  const totalPRs = allRepoEntries.reduce((s: number, repo: any) => s + (repo.pull_requests?.length ?? 0), 0);
  const mergedPRs = allRepoEntries.reduce(
    (s: number, repo: any) => s + (repo.pull_requests?.filter((p: any) => p.merged).length ?? 0),
    0
  );

  return (
    <main className="shell formPage">
      <PageBack href="/dashboard" label="Back to Dashboard" />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span className="tag">Evidence Engine</span>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", margin: "8px 0 4px" }}>Evidence & Skills Control Center</h1>
          <p className="lead" style={{ margin: 0 }}>Review real GitHub contributions, trigger AI PR reviews, and track verified skills.</p>
        </div>

        {userId && (skills?.skills?.length ?? 0) > 0 && (
          <Button variant="primary" onClick={() => router.push(`/p/${userId}`)}>
            View Public Profile →
          </Button>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "Real Commits", value: totalCommits, icon: "⬡" },
          { label: "Pull Requests", value: totalPRs, icon: "⤴" },
          { label: "Merged PRs", value: mergedPRs, icon: "✓" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "20px" }}>{s.icon}</span>
                <span style={{ fontSize: "28px", fontWeight: "bold", fontFamily: "Georgia, serif" }}>{s.value}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: "14px", marginTop: "6px" }}>{s.label}</div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>real GitHub data only</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Verified Skills Section */}
      <Card style={{ marginBottom: "28px" }}>
        <CardHeader>
          <CardTitle>★ AI-Assessed Skills</CardTitle>
          <p style={{ fontSize: "13px", color: "var(--muted)", margin: "4px 0 0 0" }}>
            Every skill is linked to real merged PR evidence. AI-assessed for learning guidance.
          </p>
        </CardHeader>
        <CardContent>
          {!skills || !skills.skills || skills.skills.length === 0 ? (
            <div className="notice" style={{ textAlign: "center", padding: "20px" }}>
              <p style={{ margin: "0 0 8px 0", color: "var(--muted)" }}>No verified skills yet.</p>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)" }}>
                Merge a pull request on GitHub, then click <strong>⚒️ AI Review</strong> below to populate skills automatically.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                {skills.skills.map((s: any) => (
                  <div
                    key={s.skill}
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      borderRadius: "10px",
                      padding: "12px 16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <strong style={{ fontSize: "14px" }}>{s.skill}</strong>
                      {getConfidenceBadge(s.confidence)}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                      {s.evidence?.length || 1} evidence record(s)
                      {s.evidence?.[0]?.id && (
                        <span style={{ display: "block", fontSize: "11px", color: "var(--mint)", marginTop: "2px" }}>
                          Ref: #{s.evidence[0].id.slice(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: "12px", color: "var(--muted)", fontStyle: "italic", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "10px" }}>
                ℹ️ AI-assessed · Advisory only · Not professional certification
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GitHub Evidence Per Project */}
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "24px", marginBottom: "16px" }}>Project GitHub Evidence</h2>

      {projects.map((p: any) => {
        const repos = evidence[p.id] || [];
        if (repos.length === 0) return null;

        return (
          <Card key={p.id} style={{ marginBottom: "20px" }}>
            <CardHeader>
              <CardTitle>⬡ {p.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {repos.map((repo: any) => (
                <div key={repo.repo} style={{ marginBottom: "16px" }}>
                  <a
                    href={`https://github.com/${repo.repo}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "14px", fontWeight: 600, color: "var(--mint)", textDecoration: "none" }}
                  >
                    github.com/{repo.repo} ↗
                  </a>

                  {/* Commits */}
                  {repo.commits && repo.commits.length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>
                        Commits ({repo.commits.length}):
                      </span>
                      <div style={{ marginTop: "6px", display: "grid", gap: "6px" }}>
                        {repo.commits.slice(0, 5).map((c: any) => (
                          <div
                            key={c.sha}
                            style={{
                              fontSize: "12px",
                              padding: "6px 10px",
                              background: "#f9f8f6",
                              borderRadius: "6px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>
                              <code style={{ background: "rgba(0,0,0,0.06)", padding: "2px 4px", borderRadius: "4px" }}>
                                {c.sha}
                              </code>{" "}
                              {c.message}
                            </span>
                            {c.task_linked && <Badge variant="success">Task Linked</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pull Requests */}
                  {repo.pull_requests && repo.pull_requests.length > 0 && (
                    <div style={{ marginTop: "14px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>
                        Pull Requests ({repo.pull_requests.length}):
                      </span>
                      <div style={{ marginTop: "6px", display: "grid", gap: "8px" }}>
                        {repo.pull_requests.map((pr: any) => (
                          <div
                            key={pr.number || pr.id}
                            style={{
                              padding: "10px 14px",
                              background: "#ffffff",
                              border: "1px solid rgba(0,0,0,0.08)",
                              borderRadius: "8px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "8px",
                            }}
                          >
                            <div>
                              <Badge variant={pr.merged ? "success" : "secondary"}>
                                {pr.merged ? "Merged" : pr.state}
                              </Badge>{" "}
                              <strong style={{ fontSize: "13px" }}>#{pr.number}</strong> {pr.title || "Pull Request"}
                            </div>

                            {pr.merged && (
                              <div>
                                {reviews[pr.id] ? (
                                  <div style={{ fontSize: "12px", color: "var(--mint)", fontWeight: 600 }}>
                                    ✓ AI Reviewed ({reviews[pr.id].skills_demonstrated?.length || 0} skills found)
                                  </div>
                                ) : (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleReview(pr.id)}
                                    disabled={reviewLoading === pr.id}
                                    style={{ fontSize: "11px" }}
                                  >
                                    {reviewLoading === pr.id ? "Reviewing..." : "⚒️ AI Review"}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {totalCommits === 0 && (
        <Card style={{ textAlign: "center", padding: "40px 20px" }}>
          <span style={{ fontSize: "24px" }}>⬡</span>
          <h3 style={{ fontFamily: "Georgia, serif", margin: "8px 0" }}>No GitHub evidence yet</h3>
          <p style={{ fontSize: "14px", color: "var(--muted)", maxWidth: "500px", margin: "0 auto 16px auto" }}>
            Link a GitHub repository to your project, push commits, and open pull requests. Real evidence will appear here automatically.
          </p>
          <Button variant="primary" onClick={() => router.push("/github")}>
            Connect GitHub →
          </Button>
        </Card>
      )}

      {/* Public Profile CTA Banner */}
      {userId && (skills?.skills?.length ?? 0) > 0 && (
        <Card style={{ marginTop: "28px", background: "rgba(0, 161, 155, 0.05)", border: "1px solid rgba(0, 161, 155, 0.2)", textAlign: "center", padding: "28px" }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", margin: "0 0 8px 0" }}>Your proof-of-work profile is ready!</h3>
          <p style={{ fontSize: "14px", color: "var(--muted)", margin: "0 0 16px 0" }}>
            Share your unauthenticated proof profile with recruiters — every skill is backed by real GitHub evidence.
          </p>
          <Button variant="primary" onClick={() => router.push(`/p/${userId}`)}>
            View Public Profile →
          </Button>
        </Card>
      )}
    </main>
  );
}
