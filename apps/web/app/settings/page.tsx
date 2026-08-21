"use client";

import React, { useState, useEffect } from "react";
import { User as UserIcon, Shield, GitBranch, Bell, Key, Sparkles, Check, Save } from "lucide-react";
import PageBack from "@/components/PageBack";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "role" | "privacy" | "github" | "notifications">("profile");
  
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [educationYear, setEducationYear] = useState("3rd year");
  const [location, setLocation] = useState("");
  const [profilePublic, setProfilePublic] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    api("/settings/me")
      .then((data) => {
        setFullName(data.full_name || "");
        setHeadline(data.headline || "");
        setBio(data.bio || "");
        setTargetRole(data.target_role || "");
        setExperienceLevel(data.experience_level || "intermediate");
        setEducationYear(data.education_year || "3rd year");
        setLocation(data.location || "");
        setProfilePublic(!!data.profile_public);
        setGithubConnected(!!data.github_connected);
        setGithubUsername(data.github_username || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg("");

    try {
      await api("/settings/me", {
        method: "PATCH",
        body: JSON.stringify({
          full_name: fullName,
          headline,
          bio,
          target_role: targetRole,
          experience_level: experienceLevel,
          education_year: educationYear,
          location,
          profile_public: profilePublic
        })
      });
      setStatusMsg("✅ Settings saved successfully!");
    } catch {
      setStatusMsg("⚠️ Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#e4ddd3] text-[#1a1410] p-8">
        <div className="max-w-4xl mx-auto p-12 text-center text-[#7a6f67]">
          ⏳ Loading settings...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#e4ddd3] text-[#1a1410] p-8 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageBack href="/dashboard" label="Back to Dashboard" />

        <div className="border-b border-black/10 pb-4">
          <h1 className="text-3xl font-bold font-serif text-[#1a1410] flex items-center gap-3">
            ⚙️ Account & Platform Settings
          </h1>
          <p className="text-sm text-[#7a6f67] mt-1">Manage your developer profile, target role, GitHub integration, and privacy preferences.</p>
        </div>

        {statusMsg && (
          <div className="p-3.5 rounded-xl bg-[#00a19b]/10 text-[#00a19b] border border-[#00a19b]/30 text-sm font-semibold">
            {statusMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Settings Navigation Tabs */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 ${activeTab === "profile" ? "bg-[#1a1410] text-white shadow-sm font-semibold" : "bg-white/60 hover:bg-white/90 text-[#1a1410]"}`}
            >
              <UserIcon className="w-4 h-4" /> Profile Info
            </button>
            <button
              onClick={() => setActiveTab("role")}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 ${activeTab === "role" ? "bg-[#1a1410] text-white shadow-sm font-semibold" : "bg-white/60 hover:bg-white/90 text-[#1a1410]"}`}
            >
              <Sparkles className="w-4 h-4 text-[#00a19b]" /> Target Role & Level
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 ${activeTab === "privacy" ? "bg-[#1a1410] text-white shadow-sm font-semibold" : "bg-white/60 hover:bg-white/90 text-[#1a1410]"}`}
            >
              <Shield className="w-4 h-4 text-emerald-700" /> Privacy & Links
            </button>
            <button
              onClick={() => setActiveTab("github")}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 ${activeTab === "github" ? "bg-[#1a1410] text-white shadow-sm font-semibold" : "bg-white/60 hover:bg-white/90 text-[#1a1410]"}`}
            >
              <GitBranch className="w-4 h-4 text-indigo-700" /> GitHub Connection
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 ${activeTab === "notifications" ? "bg-[#1a1410] text-white shadow-sm font-semibold" : "bg-white/60 hover:bg-white/90 text-[#1a1410]"}`}
            >
              <Bell className="w-4 h-4" /> Notifications
            </button>
          </div>

          {/* Settings Tab Content */}
          <div className="md:col-span-3 bg-white/80 border border-black/10 rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSave} className="space-y-5">
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-serif text-[#1a1410]">Personal Information</h3>
                  <div>
                    <label className="block text-xs font-semibold text-[#7a6f67] mb-1">Full Name</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a19b]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7a6f67] mb-1">Headline</label>
                    <input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Backend Developer & Systems Student"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a19b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7a6f67] mb-1">Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a19b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7a6f67] mb-1">Location</label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bengaluru, India"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a19b]"
                    />
                  </div>
                </div>
              )}

              {activeTab === "role" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-serif text-[#1a1410]">Career Target & Experience</h3>
                  <div>
                    <label className="block text-xs font-semibold text-[#7a6f67] mb-1">Target Role</label>
                    <input
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Backend Engineer / Systems Developer"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a19b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7a6f67] mb-1">Experience Level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a19b]"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7a6f67] mb-1">Education Year</label>
                    <select
                      value={educationYear}
                      onChange={(e) => setEducationYear(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-black/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a19b]"
                    >
                      <option value="1st year">1st Year</option>
                      <option value="2nd year">2nd Year</option>
                      <option value="3rd year">3rd Year</option>
                      <option value="4th year">4th Year</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-serif text-[#1a1410]">Privacy & Public Profile</h3>
                  <div className="p-4 bg-[#eee8df]/70 border border-black/10 rounded-xl space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profilePublic}
                        onChange={(e) => setProfilePublic(e.target.checked)}
                        className="w-4 h-4 accent-[#00a19b]"
                      />
                      <span className="text-sm font-semibold text-[#1a1410]">Make Proof-of-Work Portfolio Publicly Discoverable</span>
                    </label>
                    <p className="text-xs text-[#7a6f67]">
                      When enabled, recruiters and peers can view your verified skill evidence badges. Private task details and repository code are never exposed.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "github" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-serif text-[#1a1410]">GitHub OAuth Integration</h3>
                  <div className="p-4 bg-[#eee8df]/70 border border-black/10 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#1a1410] flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-[#00a19b]" /> GitHub Account Status
                      </span>
                      {githubConnected ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-600/10 text-emerald-800 border border-emerald-600/20">
                          Connected (@{githubUsername})
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-600/10 text-amber-800 border border-amber-600/20">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#7a6f67]">
                      Connecting your GitHub account allows Śiṣya Abhyāsa to record attributable commit and PR telemetry to generate verified engineering evidence.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold font-serif text-[#1a1410]">Notification Preferences</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#00a19b]" />
                      <span className="text-sm text-[#1a1410]">In-app task due reminders and blocker alerts</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#00a19b]" />
                      <span className="text-sm text-[#1a1410]">PR merge & verified evidence notifications</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-black/10 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#00a19b] hover:bg-[#008782] text-white text-sm font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
