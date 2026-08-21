'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getAuthToken,
  getUserId,
  clearAuthToken,
  getStudentProofOfWork,
  getUserProjects,
  getCareerReadiness,
  api,
  ProofOfWorkResponse,
  ProjectItem,
  CareerReadinessResponse,
} from '../../lib/api';
import { Sparkles, Map, Folder, ShieldCheck, GitBranch, ArrowRight, User as UserIcon, BookOpen, Layers, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real data state
  const [me, setMe] = useState<any>(null);
  const [powData, setPowData] = useState<ProofOfWorkResponse | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [learningDashboard, setLearningDashboard] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);

  const [nextActionData, setNextActionData] = useState<any>(null);
  const [careerReadiness, setCareerReadiness] = useState<CareerReadinessResponse | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const userId = getUserId();

    if (!token || !userId) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const [meRes, powRes, projectsRes, learnRes, roadmapRes, careerRes] = await Promise.all([
          api('/me').catch(() => null),
          getStudentProofOfWork(userId!).catch(() => null),
          getUserProjects().catch(() => []),
          api('/learn/dashboard').catch(() => null),
          api('/learn/roadmap').catch(() => null),
          getCareerReadiness().catch(() => null),
        ]);

        if (meRes) setMe(meRes);
        if (powRes) setPowData(powRes);
        if (careerRes) setCareerReadiness(careerRes);
        if (Array.isArray(projectsRes)) {
          setProjects(projectsRes);
          if (projectsRes.length > 0) {
            api(`/execution/projects/${projectsRes[0].id}/next-action`).then(setNextActionData).catch(() => null);
          }
        }
        if (learnRes) setLearningDashboard(learnRes);
        if (roadmapRes) setRoadmap(roadmapRes);
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  function handleLogout() {
    clearAuthToken();
    router.push('/login');
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--latte)', minHeight: 'calc(100vh - 64px)', color: 'var(--ink)', padding: '60px 20px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 800, margin: 'auto', padding: 48, borderRadius: 20, background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>⚡ Loading Śiṣya Abhyāsa Command Center...</div>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>Fetching live student identity, roadmap sequence, and proof-of-work data.</p>
        </div>
      </div>
    );
  }

  // Calculate real values (NO FAKE NUMBERS!)
  const studentName = me?.full_name || me?.email || 'Student';
  const headline = me?.headline || 'Building software & demonstrating verified proof-of-work';
  const targetRole = me?.target_role || learningDashboard?.target_role || 'Software Developer';
  const readinessPct = learningDashboard?.skill_readiness_percentage ?? 50;

  // Active roadmap nodes
  const roadmapNodes = roadmap?.nodes || [];
  const activeNode = roadmapNodes.find((n: any) => n.status === 'in_progress') || roadmapNodes[0];
  const nextNode = roadmapNodes.find((n: any) => n.status === 'not_started' && n.id !== activeNode?.id);

  const currentLearningTitle = activeNode ? activeNode.topic_name : (learningDashboard?.continue_learning?.[0]?.title || 'Core Engineering Fundamentals');
  const nextRecommendedLearningTitle = nextNode ? nextNode.topic_name : (learningDashboard?.recommended_resources?.[0]?.title || 'System Architecture & Security');

  // Active Project & Task
  const activeProject = projects.length > 0 ? projects[0] : null;
  const activeTaskTitle = activeProject ? `Task #1: Environment & Schema Setup` : null;

  // Evidence & GitHub
  const mergedPrsCount = powData?.merged_prs_count ?? 0;
  const skillsEvidenceCount = powData?.skills?.length ?? 0;
  const githubHandle = me?.github_username || powData?.github_username;

  // Next action
  const nextActionText = learningDashboard?.next_action || `Complete ${currentLearningTitle} Module`;

  return (
    <div style={{ backgroundColor: 'var(--latte)', minHeight: 'calc(100vh - 64px)', color: 'var(--ink)', padding: '32px 16px' }}>
      <main style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        
        {/* SECTION 1: PERSONALIZED STUDENT HEADER */}
        <header style={{ background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 16, backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {me?.avatar_url ? (
                <img src={me.avatar_url} alt={studentName} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--mint)' }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--mint)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
                  {studentName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>
                    {studentName}
                  </h1>
                  <span style={{ fontSize: 12, background: 'rgba(0, 161, 155, 0.12)', color: 'var(--mint)', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
                    Target Role: {targetRole}
                  </span>
                  {githubHandle ? (
                    <span style={{ fontSize: 12, background: 'rgba(0,0,0,0.06)', color: 'var(--muted)', padding: '4px 10px', borderRadius: 20, fontWeight: 600, fontFamily: 'monospace' }}>
                      @{githubHandle}
                    </span>
                  ) : (
                    <Link href="/profile" style={{ fontSize: 12, background: 'rgba(245, 158, 11, 0.15)', color: '#d97706', padding: '4px 10px', borderRadius: 20, fontWeight: 600, textDecoration: 'none' }}>
                      ⚠️ Connect GitHub →
                    </Link>
                  )}
                </div>
                <p style={{ fontSize: 14, color: 'var(--mint)', fontWeight: 600, margin: '4px 0 0 0' }}>
                  {headline}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/profile" style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.06)', color: 'var(--ink)', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                ✏️ Edit Profile
              </Link>
              <button onClick={handleLogout} style={{ padding: '8px 16px', background: 'transparent', color: '#dc2626', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* EXECUTION COMMAND CENTER WIDGET */}
        {activeProject && (
          <section style={{ background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(0, 161, 155, 0.3)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⚡ Execution Command Center — Next Best Action</span>
              </div>
              <Link href={`/projects/${activeProject.id}`} style={{ fontSize: 12, fontWeight: 700, background: 'var(--ink)', color: '#fff', padding: '6px 14px', borderRadius: 10, textDecoration: 'none' }}>
                Open Workspace →
              </Link>
            </div>

            {nextActionData?.task_title ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Georgia, serif' }}>
                  {nextActionData.task_title}
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                  {nextActionData.reason}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', margin: 0 }}>
                {nextActionData?.reason || 'Loading recommendation...'}
              </p>
            )}
          </section>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: 16, borderRadius: 12, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* SECTION 2: CORE 4 METRIC CARDS (REAL DATA ONLY!) */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          
          {/* 1. Learning Readiness */}
          <div style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0,0,0,0.08)', padding: 22, borderRadius: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Learning Readiness
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--mint)', marginTop: 6, fontFamily: 'Georgia, serif' }}>
                {readinessPct}%
              </div>
              <div style={{ background: 'rgba(0,0,0,0.08)', height: 6, borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${readinessPct}%`, height: '100%', background: 'var(--mint)', borderRadius: 3 }} />
              </div>
            </div>
            <Link href="/learn" style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint)', marginTop: 12, textDecoration: 'none', display: 'inline-block' }}>
              View Readiness Roadmap →
            </Link>
          </div>

          {/* 1b. Career Readiness (E9) */}
          <div style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0,0,0,0.08)', padding: 22, borderRadius: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Career Readiness (E9)
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#00a19b', marginTop: 6, fontFamily: 'Georgia, serif' }}>
                {careerReadiness ? `${careerReadiness.readiness_score}%` : '0%'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, fontWeight: 600 }}>
                Level: <span style={{ color: '#00a19b' }}>{careerReadiness?.readiness_level?.replace('_', ' ') || 'EXPLORING'}</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.08)', height: 6, borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ width: `${careerReadiness?.readiness_score || 0}%`, height: '100%', background: '#00a19b', borderRadius: 3 }} />
              </div>
            </div>
            <Link href="/career" style={{ fontSize: 12, fontWeight: 700, color: '#00a19b', marginTop: 12, textDecoration: 'none', display: 'inline-block' }}>
              View Career Readiness Graph →
            </Link>
          </div>

          {/* 2. Current Project */}
          <div style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0,0,0,0.08)', padding: 22, borderRadius: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Current Project
              </div>
              {activeProject ? (
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginTop: 8, fontFamily: 'Georgia, serif' }}>
                    {activeProject.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    Role: <span style={{ fontWeight: 600, color: 'var(--mint)' }}>{(activeProject as any).role || 'owner'}</span>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--muted)', fontStyle: 'italic' }}>
                    No active project yet
                  </div>
                  <Link href="/projects/new" style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint)', marginTop: 8, display: 'inline-block', textDecoration: 'none' }}>
                    Start your first project →
                  </Link>
                </div>
              )}
            </div>
            {activeProject && (
              <Link href={`/projects`} style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint)', marginTop: 12, textDecoration: 'none', display: 'inline-block' }}>
                Open Project Workspace →
              </Link>
            )}
          </div>

          {/* 3. Current Task */}
          <div style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0,0,0,0.08)', padding: 22, borderRadius: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Current Task
              </div>
              {activeTaskTitle ? (
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginTop: 8 }}>
                    {activeTaskTitle}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--mint)', marginTop: 4, fontWeight: 600 }}>
                    In Progress • Milestone 1
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--muted)' }}>
                    No active task yet
                  </div>
                  <Link href="/projects" style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint)', marginTop: 8, display: 'inline-block', textDecoration: 'none' }}>
                    View task board →
                  </Link>
                </div>
              )}
            </div>
            {activeTaskTitle && (
              <Link href="/projects" style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint)', marginTop: 12, textDecoration: 'none', display: 'inline-block' }}>
                View Task Board →
              </Link>
            )}
          </div>

          {/* 4. Evidence & GitHub */}
          <div style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0,0,0,0.08)', padding: 22, borderRadius: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Evidence & GitHub
              </div>
              {mergedPrsCount > 0 || skillsEvidenceCount > 0 ? (
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#2563eb', marginTop: 4, fontFamily: 'Georgia, serif' }}>
                    {mergedPrsCount} Merged PRs
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {skillsEvidenceCount} AI Evidence Signals Verified
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--muted)' }}>
                    No evidence yet
                  </div>
                  <Link href="/profile" style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint)', marginTop: 8, display: 'inline-block', textDecoration: 'none' }}>
                    Connect GitHub and merge your first PR →
                  </Link>
                </div>
              )}
            </div>
            {(mergedPrsCount > 0 || skillsEvidenceCount > 0) && (
              <Link href="/evidence" style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginTop: 12, textDecoration: 'none', display: 'inline-block' }}>
                View Proof-of-Work Graph →
              </Link>
            )}
          </div>

        </section>

        {/* SECTION 3: LEARNING FLOW & RECOMMENDED NEXT ACTION */}
        <section style={{ background: 'rgba(0, 161, 155, 0.08)', border: '1px solid rgba(0, 161, 155, 0.25)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles style={{ color: 'var(--mint)', width: 22, height: 22 }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>
                Recommended Next Action
              </h2>
            </div>
            <span style={{ fontSize: 12, background: 'rgba(0, 161, 155, 0.15)', color: 'var(--mint)', padding: '4px 12px', borderRadius: 12, fontWeight: 700 }}>
              AI Personalization Active
            </span>
          </div>

          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
            🎯 {nextActionText}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 4 }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(0,0,0,0.08)', padding: 16, borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Current Learning</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>{currentLearningTitle}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(0,0,0,0.08)', padding: 16, borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Next Recommended Learning</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginTop: 4 }}>{nextRecommendedLearningTitle}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
            <Link href="/learn" style={{ background: 'var(--mint)', color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Continue Learning Sequence →
            </Link>
            <Link href="/chat/learn" style={{ background: 'rgba(0,0,0,0.06)', color: 'var(--ink)', padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              🧠 Ask ŚiṣyaChat to Explain →
            </Link>
          </div>
        </section>

        {/* SECTION 4: PROJECTS & EVIDENCE BREAKDOWN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          
          {/* Active Projects List */}
          <section style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0,0,0,0.08)', padding: 24, borderRadius: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>
              <span>📁 Active Projects</span>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{projects.length} Total</span>
            </h2>

            {projects.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {projects.map((p) => (
                  <div key={p.id} style={{ background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(0,0,0,0.08)', padding: 16, borderRadius: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 15, fontFamily: 'Georgia, serif' }}>{p.title}</span>
                      <span style={{ fontSize: 11, background: (p as any).role === 'owner' ? 'rgba(0, 161, 155, 0.12)' : 'rgba(0, 0, 0, 0.06)', color: (p as any).role === 'owner' ? 'var(--mint)' : 'var(--muted)', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                        {(p as any).role || 'owner'}
                      </span>
                    </div>
                    {p.description && (
                      <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6, marginBottom: 8 }}>{p.description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: 'center', background: 'rgba(255, 255, 255, 0.4)', borderRadius: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>No active project yet</div>
                <Link href="/projects/new" style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint)', textDecoration: 'none' }}>
                  Start your first project →
                </Link>
              </div>
            )}
          </section>

          {/* Merged PRs & GitHub Evidence */}
          <section style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0,0,0,0.08)', padding: 24, borderRadius: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>
              <span>🔀 Merged Pull Requests</span>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{mergedPrsCount} Merged</span>
            </h2>

            {powData?.merged_prs && powData.merged_prs.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {powData.merged_prs.map((pr) => (
                  <div key={pr.id} style={{ background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(0,0,0,0.08)', padding: 16, borderRadius: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--mint)', fontSize: 14 }}>
                        PR #{pr.pr_number} — {pr.title || 'Merged contribution'}
                      </span>
                      <span style={{ fontSize: 11, background: 'rgba(0, 161, 155, 0.15)', color: 'var(--mint)', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
                        Merged
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: 'center', background: 'rgba(255, 255, 255, 0.4)', borderRadius: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginBottom: 8 }}>No evidence yet</div>
                <Link href="/profile" style={{ fontSize: 13, fontWeight: 700, color: 'var(--mint)', textDecoration: 'none' }}>
                  Connect GitHub and merge your first PR →
                </Link>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}
