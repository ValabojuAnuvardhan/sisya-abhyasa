"use client";

import React, { useState, useEffect } from "react";
import { WorkPostCard } from "@/components/network/WorkPostCard";
import { Globe, Users, PlusCircle, Hammer, Sparkles, CheckCircle2, Search } from "lucide-react";
import { api } from "@/lib/api";

interface Post {
  id: string;
  author_name: string;
  author_username: string;
  author_role: string;
  post_type: string;
  title: string;
  content: string;
  skill_topic?: string;
  resource_title?: string;
  github_pr_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  rebuilds_count: number;
  user_has_liked: boolean;
  created_at: string;
}

export default function NetworkPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPostType, setNewPostType] = useState("LEARNING");
  const [newSkillTopic, setNewSkillTopic] = useState("");
  const [newVisibility, setNewVisibility] = useState("PUBLIC");
  const [rebuildResult, setRebuildResult] = useState<any>(null);
  const [rebuilding, setRebuilding] = useState<string | null>(null);

  const fetchFeed = async (currentFilter = filter) => {
    try {
      const typeParam = currentFilter === "all" ? "ALL" : currentFilter.toUpperCase();
      const data = await api(`/network/feed?type=${typeParam}`);
      if (Array.isArray(data)) {
        setPosts(data);
      }
    } catch {
      setPosts([
        {
          id: "seed-1",
          author_name: "Anuvardhan",
          author_username: "anuvardhan",
          author_role: "Backend Developer",
          post_type: "LEARNING",
          title: "Mastered PostgreSQL B-Tree Indexing",
          content: "🧠 I finally understood how PostgreSQL B-Tree indexes work and how EXPLAIN ANALYZE helps locate slow sequence scans!",
          skill_topic: "PostgreSQL Indexing",
          github_pr_url: undefined,
          likes_count: 8,
          comments_count: 3,
          shares_count: 2,
          rebuilds_count: 0,
          user_has_liked: true,
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  useEffect(() => {
    fetchFeed(filter);
  }, [filter]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      await api("/network/posts", {
        method: "POST",
        body: JSON.stringify({
          title: newTitle.trim() || undefined,
          content: newContent.trim(),
          post_type: newPostType.toUpperCase(),
          skill_topic: newSkillTopic.trim() || undefined,
          visibility: newVisibility
        })
      });

      setNewTitle("");
      setNewContent("");
      setNewSkillTopic("");
      setShowCreateModal(false);
      fetchFeed(filter);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRebuild = async (postId: string, mode: "SOLO" | "TEAM" = "SOLO") => {
    setRebuilding(postId);
    setRebuildResult(null);
    try {
      const data = await api(`/network/posts/${postId}/rebuild`, {
        method: "POST",
        body: JSON.stringify({ collaboration_mode: mode })
      });
      setRebuildResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRebuilding(null);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (filter === "all") return true;
    const pUpper = (p.post_type || "").toUpperCase();
    const fUpper = filter.toUpperCase();
    if (fUpper === "PROJECT") return pUpper === "PROJECT" || pUpper === "PROJECT_UPDATE" || pUpper === "PROJECT_LAUNCH";
    if (fUpper === "PROGRESS") return pUpper === "PROGRESS" || pUpper === "BUILD_LOG";
    return pUpper === fUpper;
  });

  return (
    <div className="min-h-screen bg-[#e4ddd3] text-[#1a1410] p-8 space-y-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold font-serif tracking-tight text-[#1a1410] flex items-center gap-3">
              🌐 Śiṣya Abhyāsa Community Hub <span className="text-sm font-sans font-semibold px-3 py-1 rounded-full bg-[#00a19b]/10 text-[#00a19b] border border-[#00a19b]/25">Real Work Network</span>
            </h1>
            <p className="text-[#7a6f67] mt-1">Connect with engineers, discover real proof-of-work, and rebuild inspirational project ideas independently.</p>

            {/* 4 Community Pillars */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-semibold">
              <span className="px-3 py-1 bg-white/70 border border-black/10 rounded-lg text-[#1a1410] shadow-sm">
                🧠 Learn Together
              </span>
              <span className="px-3 py-1 bg-white/70 border border-black/10 rounded-lg text-[#1a1410] shadow-sm">
                🔨 Build Together
              </span>
              <span className="px-3 py-1 bg-white/70 border border-black/10 rounded-lg text-[#1a1410] shadow-sm">
                🔍 Discover Real Work
              </span>
              <span className="px-3 py-1 bg-[#00a19b]/10 border border-[#00a19b]/30 rounded-lg text-[#00a19b] shadow-sm font-bold">
                ⚡ Rebuild Ideas Independently
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-[#00a19b] hover:bg-[#008782] text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" /> Share Work Post
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex overflow-x-auto gap-2 border-b border-black/10 pb-2">
          {[
            { id: "all", label: "All Activity" },
            { id: "LEARNING", label: "🧠 Learning" },
            { id: "PROJECT", label: "🔨 Projects" },
            { id: "PROGRESS", label: "📈 Progress" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === item.id
                  ? "bg-[#1a1410] text-white shadow-sm"
                  : "bg-white/60 text-[#7a6f67] hover:text-[#1a1410] border border-black/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Rebuild Banner Modal / Alert */}
        {rebuildResult && (
          <div className="bg-[#eee8df] border border-amber-600/30 rounded-2xl p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-900 text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600" /> 🔨 Rebuild Successful!
              </h3>
              <button onClick={() => setRebuildResult(null)} className="text-xs text-[#7a6f67] hover:text-[#1a1410]">Dismiss</button>
            </div>
            <p className="text-sm text-[#4a4038]">
              AI Project Architect generated your personalized project: <strong className="text-[#1a1410]">{rebuildResult.project_title}</strong>.
            </p>
            <div className="text-xs text-[#7a6f67]">
              Created {rebuildResult.milestones_count} milestones and {rebuildResult.tasks_count} tasks in your Project Hub.
            </div>
          </div>
        )}

        {/* Feed Grid */}
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <WorkPostCard key={post.id} post={post} onRebuild={handleRebuild} />
          ))}
        </div>
      </div>

      {/* Create Work Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#f7f2eb] border border-black/15 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold font-serif text-[#1a1410]">Share Engineering Work</h3>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7a6f67] uppercase tracking-wider">Post Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Completed JWT Authentication Milestone"
                  className="w-full bg-white border border-black/15 rounded-lg px-4 py-2 text-sm text-[#1a1410] focus:outline-none focus:border-[#00a19b] mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#7a6f67] uppercase tracking-wider">Post Type</label>
                <select
                  value={newPostType}
                  onChange={(e) => setNewPostType(e.target.value)}
                  className="w-full bg-white border border-black/15 rounded-lg px-4 py-2 text-sm text-[#1a1410] focus:outline-none focus:border-[#00a19b] mt-1"
                >
                  <option value="LEARNING">🧠 Learning Summary</option>
                  <option value="PROJECT">🔨 Project Update</option>
                  <option value="PROGRESS">📈 Progress Milestone</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#7a6f67] uppercase tracking-wider">Content</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="What engineering progress, learning, or milestone did you achieve?"
                  className="w-full bg-white border border-black/15 rounded-lg px-4 py-2 text-sm text-[#1a1410] focus:outline-none focus:border-[#00a19b] mt-1"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white border border-black/15 hover:bg-[#eee8df] text-[#1a1410] text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00a19b] hover:bg-[#008782] text-white text-sm font-semibold rounded-lg shadow-sm"
                >
                  Publish Work Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
