"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { User as UserIcon, BookOpen, Cpu, Folder, GitBranch, ShieldCheck, TrendingUp, Settings, ExternalLink, Save, Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { api } from "../../lib/api";

interface SkillItem {
  id: string;
  name: string;
  slug: string;
}

export default function PrivateProfilePage() {
  const { user, refetchUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"settings" | "learn" | "skills" | "projects" | "github" | "evidence" | "career">("settings");
  
  // Data snapshot for cancel restoration
  const [originalData, setOriginalData] = useState<any>(null);

  // Form fields
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [educationYear, setEducationYear] = useState("3rd year");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [location, setLocation] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profilePublic, setProfilePublic] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Data lists
  const [availableSkills, setAvailableSkills] = useState<SkillItem[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  // Initial load
  useEffect(() => {
    Promise.all([
      api("/me").catch(() => null),
      api("/projects").catch(() => []),
      api("/skills").catch(() => [])
    ])
      .then(([meData, projs, sks]) => {
        if (meData) {
          setOriginalData(meData);
          populateForm(meData);
        }
        if (Array.isArray(projs)) setProjects(projs);
        if (Array.isArray(sks)) setAvailableSkills(sks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Update form if auth context updates
  useEffect(() => {
    if (user && !originalData) {
      setOriginalData(user);
      populateForm(user);
    }
  }, [user]);

  function populateForm(data: any) {
    setFullName(data.full_name || "");
    setHeadline(data.headline || "");
    setBio(data.bio || "");
    setTargetRole(data.target_role || "");
    setEducationYear(data.education_year || "3rd year");
    setExperienceLevel(data.experience_level || "intermediate");
    setLocation(data.location || "");
    setGithubUsername(data.github_username || "");
    setAvatarUrl(data.avatar_url || "");
    if (typeof data.profile_public === "boolean") setProfilePublic(data.profile_public);
    if (data.skills && Array.isArray(data.skills)) {
      setSelectedSkills(data.skills.map((s: any) => typeof s === "string" ? s : s.slug));
    }
  }

  const handleCancel = () => {
    if (originalData) {
      populateForm(originalData);
    }
    setIsEditing(false);
    setStatusMsg("");
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setStatusType("error");
      setStatusMsg("⚠️ Full Name must be at least 2 characters long.");
      return;
    }

    setSaving(true);
    setStatusMsg("");

    try {
      const updated = await api("/me", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: fullName.trim(),
          headline: headline.trim(),
          bio: bio.trim(),
          target_role: targetRole.trim(),
          education_year: educationYear,
          experience_level: experienceLevel,
          location: location.trim(),
          github_username: githubUsername.trim(),
          avatar_url: avatarUrl.trim(),
          profile_public: profilePublic,
          skill_slugs: selectedSkills
        })
      });

      if (updated) {
        setOriginalData(updated);
        populateForm(updated);
        await refetchUser();
        setIsEditing(false);
        setStatusType("success");
        setStatusMsg("✅ Profile updated successfully! All changes persisted.");
      }
    } catch (err: any) {
      setStatusType("error");
      setStatusMsg(`⚠️ Could not save profile: ${err.message || "Server error"}`);
    } finally {
      setSaving(false);
    }
  };

  const displayName = fullName || user?.email || "Student";
  const displayEmail = user?.email || "student@sisya.ai";
  const displayRole = targetRole || "Software Developer";
  const userId = user?.id || "demo-user-123";

  return (
    <div className="min-h-screen bg-[#e4ddd3] text-[#1a1410] p-4 md:p-8 space-y-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">        {/* Profile Header Banner */}
        <div className="bg-white/70 border border-black/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#00a19b] shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#00a19b] text-white flex items-center justify-center text-3xl font-bold font-serif shadow-md">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#1a1410] font-serif">{displayName}</h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  profilePublic 
                    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" 
                    : "bg-amber-500/10 text-amber-800 border-amber-500/30"
                }`}>
                  {profilePublic ? "🌐 Public Proof Active" : "🔒 Private Profile"}
                </span>
                {githubUsername && (
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-black/5 text-[#7a6f67]">
                    @{githubUsername}
                  </span>
                )}
              </div>
              {headline && <p className="text-sm font-medium text-[#00a19b]">{headline}</p>}
              <p className="text-xs text-[#7a6f67]">
                {displayEmail} {targetRole ? `• ${targetRole}` : ""} {location ? `• ${location}` : ""}
              </p>
              
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedSkills.length > 0 ? (
                  selectedSkills.map((sk, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00a19b]/10 text-[#00a19b] border border-[#00a19b]/30">
                      {sk}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#7a6f67] italic">No skills selected yet</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                if (isEditing) handleCancel();
                else setIsEditing(true);
              }}
              className="px-4 py-2.5 bg-[#00a19b] hover:bg-[#008782] text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Settings className="w-4 h-4" />
              <span>{isEditing ? "👀 View Mode" : "✏️ Edit Profile"}</span>
            </button>

            <Link
              href={`/p/${userId}`}
              target="_blank"
              className="px-4 py-2.5 bg-[#1a1410] hover:bg-[#2d241e] text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <ExternalLink className="w-4 h-4 text-[#00a19b]" /> View Public Proof Profile ↗
            </Link>
          </div>
        </div>

        {/* Status Notification Banner */}
        {statusMsg && (
          <div className={`p-4 rounded-xl text-sm font-medium border flex justify-between items-center ${
            statusType === "success" 
              ? "bg-emerald-500/10 text-emerald-800 border-emerald-500/30" 
              : "bg-rose-500/10 text-rose-800 border-rose-500/30"
          }`}>
            <span>{statusMsg}</span>
            <button onClick={() => setStatusMsg("")} className="text-xs font-bold underline ml-4">Dismiss</button>
          </div>
        )}

        {/* Profile Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-black/10 pb-2 scrollbar-none">
          {[
            { id: "settings", label: "Edit Profile & Settings", icon: Settings },
            { id: "learn", label: "Learn Progress", icon: BookOpen },
            { id: "skills", label: "Skills & Badges", icon: Cpu },
            { id: "projects", label: "Projects", icon: Folder },
            { id: "github", label: "GitHub Integration", icon: GitBranch },
            { id: "evidence", label: "Proof Evidence", icon: ShieldCheck },
            { id: "career", label: "Career Telemetry", icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#00a19b] text-white shadow-md"
                    : "bg-white/40 text-[#7a6f67] hover:text-[#1a1410] hover:bg-white/70"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="mt-6">
          
          {/* EDIT PROFILE & SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="bg-white/70 border border-black/10 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#1a1410] font-serif">
                    {isEditing ? "Edit Student Profile & Identity" : "Student Profile Details"}
                  </h3>
                  <p className="text-xs text-[#7a6f67] mt-1">
                    Manage your public identity, target role, bio, GitHub handle, and Proof-of-Work visibility.
                  </p>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#00a19b] text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-6 max-w-3xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-black/10">
                      <span className="text-xs font-bold text-[#7a6f67] uppercase">Full Name</span>
                      <p className="font-semibold text-base text-[#1a1410] mt-1">{displayName}</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-black/10">
                      <span className="text-xs font-bold text-[#7a6f67] uppercase">Target Role</span>
                      <p className="font-semibold text-base text-[#1a1410] mt-1">{displayRole}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-black/10">
                      <span className="text-xs font-bold text-[#7a6f67] uppercase">Headline</span>
                      <p className="font-semibold text-sm text-[#1a1410] mt-1">{headline || "None set"}</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-black/10">
                      <span className="text-xs font-bold text-[#7a6f67] uppercase">GitHub Username</span>
                      <p className="font-mono font-semibold text-sm text-[#1a1410] mt-1">{githubUsername ? `@${githubUsername}` : "Not linked"}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-black/10">
                    <span className="text-xs font-bold text-[#7a6f67] uppercase">Bio & Summary</span>
                    <p className="text-sm text-[#1a1410] mt-1 whitespace-pre-wrap">{bio || "No bio provided yet."}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-6 max-w-3xl">
                  
                  {/* Public Profile Visibility Toggle */}
                  <div className="p-4 bg-white border border-black/10 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#1a1410] flex items-center gap-2">
                        {profilePublic ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-amber-600" />}
                        Public Proof-of-Work Profile Visibility
                      </h4>
                      <p className="text-xs text-[#7a6f67] mt-0.5">
                        When enabled, recruiters and peers can view your privacy-safe proof profile card at <code className="bg-black/5 px-1 py-0.5 rounded">/p/{userId}</code>.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profilePublic}
                        onChange={(e) => setProfilePublic(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a19b]"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#1a1410] uppercase tracking-wider">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Anuvardhan Valaboju"
                        className="w-full bg-white border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#1a1410] focus:outline-none focus:border-[#00a19b] mt-1 font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#1a1410] uppercase tracking-wider">Target Role</label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Backend Engineer, Full-Stack Developer"
                        className="w-full bg-white border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#1a1410] focus:outline-none focus:border-[#00a19b] mt-1 font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#1a1410] uppercase tracking-wider">Headline / Tagline</label>
                      <input
                        type="text"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="e.g. Building distributed backend APIs & AI tools"
                        className="w-full bg-white border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#1a1410] focus:outline-none focus:border-[#00a19b] mt-1 font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#1a1410] uppercase tracking-wider">GitHub Username</label>
                      <input
                        type="text"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        placeholder="e.g. anuvardhan"
                        className="w-full bg-white border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#1a1410] focus:outline-none focus:border-[#00a19b] mt-1 font-sans font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#1a1410] uppercase tracking-wider">Avatar Image URL</label>
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-white border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#1a1410] focus:outline-none focus:border-[#00a19b] mt-1 font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#1a1410] uppercase tracking-wider">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Hyderabad, India"
                        className="w-full bg-white border border-black/15 rounded-xl px-4 py-2.5 text-sm text-[#1a1410] focus:outline-none focus:border-[#00a19b] mt-1 font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1a1410] uppercase tracking-wider">Bio & Professional Summary</label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell recruiters and peers about your engineering interests, key technical accomplishments, and what you are building..."
                      className="w-full bg-white border border-black/15 rounded-xl p-4 text-sm text-[#1a1410] focus:outline-none focus:border-[#00a19b] mt-1 font-sans resize-none"
                    />
                  </div>

                  {/* Skill Chips */}
                  <div>
                    <label className="text-xs font-bold text-[#1a1410] uppercase tracking-wider block mb-2">
                      Current Skills & Technologies ({selectedSkills.length} selected)
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 bg-white border border-black/10 rounded-xl">
                      {availableSkills.map((sk) => {
                        const isSelected = selectedSkills.includes(sk.slug);
                        return (
                          <button
                            type="button"
                            key={sk.slug}
                            onClick={() => {
                              setSelectedSkills((prev) =>
                                isSelected ? prev.filter((x) => x !== sk.slug) : [...prev, sk.slug]
                              );
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                              isSelected
                                ? "bg-[#00a19b] text-white shadow-sm"
                                : "bg-black/5 text-[#7a6f67] hover:bg-black/10 hover:text-[#1a1410]"
                            }`}
                          >
                            {sk.name} {isSelected ? "✓" : "+"}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form Action Buttons: Save & Cancel */}
                  <div className="pt-4 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#00a19b] hover:bg-[#008782] text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? "Saving Changes..." : "Save Profile & Identity"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={saving}
                      className="bg-black/10 hover:bg-black/20 text-[#1a1410] font-bold px-5 py-3 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>

                </form>
              )}
            </div>
          )}

          {/* LEARN PROGRESS TAB */}
          {activeTab === "learn" && (
            <div className="bg-white/70 border border-black/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-[#1a1410] font-serif">Learning Progress</h3>
              <p className="text-sm text-[#7a6f67]">Track active study modules, saved concepts, and roadmap progress.</p>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === "skills" && (
            <div className="bg-white/70 border border-black/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-[#1a1410] font-serif">Verified & Claimed Skills</h3>
              {selectedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-[#00a19b]/10 text-[#00a19b] border border-[#00a19b]/30 rounded-lg text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#7a6f67] italic">No skills selected yet. Select skills in Edit Profile tab.</p>
              )}
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === "projects" && (
            <div className="bg-white/70 border border-black/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-[#1a1410] font-serif">My Projects ({projects.length})</h3>
              {projects.length === 0 ? (
                <p className="text-sm text-[#7a6f67] italic">No projects created yet.</p>
              ) : (
                <div className="space-y-3">
                  {projects.map((p) => (
                    <div key={p.id} className="p-4 bg-white rounded-xl border border-black/10 flex justify-between items-center shadow-sm">
                      <div>
                        <h4 className="font-semibold text-[#1a1410]">{p.title}</h4>
                        {p.description && <p className="text-xs text-[#7a6f67]">{p.description}</p>}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-[#00a19b]/10 text-[#00a19b] rounded-md">Owner</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GITHUB TAB */}
          {activeTab === "github" && (
            <div className="bg-white/70 border border-black/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-[#1a1410] font-serif">GitHub Integration</h3>
              <p className="text-sm text-[#7a6f67]">Connected account: <span className="text-[#1a1410] font-mono font-bold">@{user?.github_username || "not-linked"}</span></p>
            </div>
          )}

          {/* EVIDENCE TAB */}
          {activeTab === "evidence" && (
            <div className="bg-white/70 border border-black/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-[#1a1410] font-serif">Proof of Work Evidence Records</h3>
              <div className="text-xs text-amber-800 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
                Advisory AI Assessment: Skill signals derived from PR reviews and verified commit hashes.
              </div>
            </div>
          )}

          {/* CAREER TAB */}
          {activeTab === "career" && (
            <div className="bg-white/70 border border-black/10 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-[#1a1410] font-serif">Career Readiness Telemetry</h3>
              <div className="text-sm text-[#1a1410]">Target Role: <strong className="text-[#00a19b]">{displayRole}</strong></div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

