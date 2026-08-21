"use client";

import React, { useState, useEffect } from "react";
import { User, ShieldCheck, Folder, GitPullRequest, Award, CheckCircle, ExternalLink, AlertCircle } from "lucide-react";
import { getStudentProofOfWork } from "../../../lib/api";

interface ProofProject {
  id: string;
  title: string;
  description?: string;
  tech_stack: string[];
  role: string;
}

interface ProofPR {
  id: string;
  pr_number: number;
  title?: string;
  repository_name?: string;
  merged_at?: string;
}

interface ProofSkill {
  skill: string;
  confidence: number;
  evidence: any[];
}

interface ProofData {
  student_id: string;
  full_name?: string;
  headline?: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  github_username?: string;
  target_role?: string;
  education_year?: number;
  projects: ProofProject[];
  projects_count: number;
  merged_prs: ProofPR[];
  merged_prs_count: number;
  skills: ProofSkill[];
  advisory?: string;
}

export default function PublicProofProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = React.use(params);
  const [data, setData] = useState<ProofData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStudentProofOfWork(userId)
      .then((d) => {
        setData(d as any);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Profile not found or is set to private.");
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--latte)', minHeight: 'calc(100vh - 64px)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--mint)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading Proof-of-Work Telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const isPrivate = error?.includes("private") || error?.includes("403");
    return (
      <div style={{ backgroundColor: 'var(--latte)', minHeight: 'calc(100vh - 64px)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div className="rounded-2xl p-8 max-w-md text-center space-y-4" style={{ background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <AlertCircle className="w-12 h-12 mx-auto" style={{ color: isPrivate ? '#00a19b' : '#d97706' }} />
          <h2 className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>
            {isPrivate ? "🔒 Private Proof Profile" : "Profile Not Found"}
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {isPrivate 
              ? "This student developer has set their Proof-of-Work profile visibility to private." 
              : `No public proof-of-work profile found for ID: ${userId}`}
          </p>
        </div>
      </div>
    );
  }

  const displayName = data.full_name || data.github_username || "Student Developer";
  const displayRole = data.target_role || "Software Engineer";

  return (
    <div style={{ backgroundColor: 'var(--latte)', minHeight: 'calc(100vh - 64px)', color: 'var(--ink)', padding: '32px 16px' }}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Recruiter Banner Notice */}
        <div className="p-4 rounded-xl text-xs flex items-center justify-between" style={{ background: 'rgba(0, 161, 155, 0.08)', border: '1px solid rgba(0, 161, 155, 0.25)', color: 'var(--ink)' }}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--mint)' }} />
            <span className="font-medium">Official Śiṣya Abhyāsa Proof-of-Work Developer Profile • Verified via GitHub Webhooks</span>
          </div>
          {data.advisory && (
            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold" style={{ background: 'rgba(0, 161, 155, 0.15)', color: 'var(--mint)' }}>{data.advisory}</span>
          )}
        </div>

        {/* 1. Identity */}
        <div className="rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-md shrink-0" style={{ background: 'var(--mint)' }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>{displayName}</h1>
              {data.headline && <p className="text-sm font-semibold" style={{ color: 'var(--mint)' }}>{data.headline}</p>}
              <p className="font-semibold text-xs" style={{ color: 'var(--muted)' }}>
                Target Role: {displayRole} {data.location ? `• ${data.location}` : ""} {data.github_username ? `• GitHub: @${data.github_username}` : ""}
              </p>
              {data.bio && <p className="text-xs pt-1 max-w-xl" style={{ color: 'var(--ink)' }}>{data.bio}</p>}
            </div>
          </div>

          <div className="rounded-xl p-4 flex gap-6 text-center shrink-0" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{data.projects_count}</div>
              <div className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Projects Built</div>
            </div>
            <div className="h-10 w-px" style={{ background: 'rgba(0, 0, 0, 0.08)' }} />
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--mint)' }}>{data.merged_prs_count}</div>
              <div className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Merged PRs</div>
            </div>
            <div className="h-10 w-px" style={{ background: 'rgba(0, 0, 0, 0.08)' }} />
            <div>
              <div className="text-2xl font-bold text-emerald-600">{data.skills.length}</div>
              <div className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Verified Skills</div>
            </div>
          </div>
        </div>

        {/* 2. Evidence-Backed Skills */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>
            <Award className="w-5 h-5" style={{ color: 'var(--mint)' }} /> Evidence-Backed Skills (Advisory AI Signals)
          </h2>
          {data.skills.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'var(--muted)' }}>No verified skill evidence recorded yet. Build projects and merge PRs to earn verified skill signals.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.skills.map((sk, i) => (
                <div key={i} className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-base" style={{ color: 'var(--ink)' }}>{sk.skill}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
                      Confidence {Math.round(sk.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Backed by {sk.evidence.length} verified evidence signal(s).</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Projects */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>
            <Folder className="w-5 h-5" style={{ color: 'var(--mint)' }} /> Proof-of-Work Projects
          </h2>
          {data.projects.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'var(--muted)' }}>No public projects created yet.</p>
          ) : (
            <div className="space-y-4">
              {data.projects.map((proj) => (
                <div key={proj.id} className="p-5 rounded-xl space-y-3" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>{proj.title}</h3>
                      <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{proj.tech_stack.join(" • ") || "General Engineering"}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold capitalize" style={{ background: 'rgba(0, 161, 155, 0.12)', color: 'var(--mint)' }}>{proj.role}</span>
                  </div>
                  {proj.description && <p className="text-sm" style={{ color: 'var(--ink)' }}>{proj.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Merged Pull Requests & Task History Evidence */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>
            <GitPullRequest className="w-5 h-5" style={{ color: 'var(--mint)' }} /> Merged Pull Requests & Task History
          </h2>
          {data.merged_prs.length === 0 ? (
            <p className="text-sm italic" style={{ color: 'var(--muted)' }}>No merged pull requests recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {data.merged_prs.map((pr) => (
                <div key={pr.id} className="p-4 rounded-xl flex justify-between items-center" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <div className="space-y-1">
                    <div className="font-bold text-sm" style={{ color: 'var(--ink)' }}>PR #{pr.pr_number}: {pr.title || "Merged Pull Request"}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{pr.repository_name || "Linked Repo"} • Verified via GitHub Webhook</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center text-xs pt-4" style={{ color: 'var(--muted)' }}>
          Śiṣya Abhyāsa Proof-of-Work Platform • AI skill evaluations are advisory and intended for learning guidance & recruiter signal validation.
        </div>
      </div>
    </div>
  );
}
