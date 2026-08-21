"use client";

import React, { useState } from "react";
import { Heart, MessageSquare, Share2, Hammer, GitPullRequest, Folder, Calendar } from "lucide-react";
import { api } from "@/lib/api";

interface WorkPostProps {
  post: {
    id: string;
    author_name: string;
    author_username: string;
    author_role: string;
    post_type: string;
    title?: string | null;
    content: string;
    skill_topic?: string | null;
    resource_title?: string | null;
    project_id?: string | null;
    project_title?: string | null;
    project_description?: string | null;
    project_progress_summary?: string | null;
    verified_proof_count?: number;
    github_pr_url?: string;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    rebuilds_count: number;
    user_has_liked: boolean;
    created_at: string;
  };
  onRebuild: (postId: string) => void;
}

export function WorkPostCard({ post, onRebuild }: WorkPostProps) {
  const [liked, setLiked] = useState(post.user_has_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const handleLike = async () => {
    try {
      const data = await api(`/network/posts/${post.id}/like`, { method: "POST" });
      setLiked(data.liked);
      setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1));
    } catch {
      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    }
  };

  const getPostBadge = (type: string) => {
    const tUpper = (type || "").toUpperCase();
    switch (tUpper) {
      case "LEARNING":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00a19b]/10 text-[#00a19b] border border-[#00a19b]/25">🧠 Learning</span>;
      case "PROJECT":
      case "PROJECT_UPDATE":
      case "PROJECT_LAUNCH":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-600/10 text-indigo-700 border border-indigo-600/25">🔨 Project</span>;
      case "PROGRESS":
      case "BUILD_LOG":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600/10 text-emerald-700 border border-emerald-600/25">📈 Progress</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-600/10 text-blue-700 border border-blue-600/25">💡 Technical Post</span>;
    }
  };

  return (
    <div className="bg-white/80 border border-black/10 rounded-2xl p-6 space-y-4 hover:border-black/20 hover:shadow-md transition-all shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00a19b] flex items-center justify-center font-bold text-white shadow-sm">
            {post.author_name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[#1a1410]">{post.author_name}</h4>
              <span className="text-xs text-[#7a6f67]">@{post.author_username}</span>
            </div>
            <p className="text-xs text-[#7a6f67]">{post.author_role}</p>
          </div>
        </div>
        {getPostBadge(post.post_type)}
      </div>

      {/* Title & Body */}
      <div className="space-y-2">
        {post.title && <h3 className="text-lg font-bold font-serif text-[#1a1410]">{post.title}</h3>}
        <p className="text-sm text-[#4a4038] whitespace-pre-wrap leading-relaxed">{post.content}</p>

        {/* Public Project Telemetry Card */}
        {post.project_title && (
          <div className="bg-[#eee8df]/70 border border-black/10 rounded-xl p-4 space-y-2 my-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1a1410] flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-[#00a19b]" /> {post.project_title}
              </span>
              {post.project_progress_summary && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#00a19b]/10 text-[#00a19b] border border-[#00a19b]/20">
                  🎯 {post.project_progress_summary}
                </span>
              )}
            </div>
            {post.project_description && (
              <p className="text-xs text-[#7a6f67] line-clamp-2">{post.project_description}</p>
            )}
            {post.verified_proof_count !== undefined && post.verified_proof_count > 0 && (
              <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                🛡️ {post.verified_proof_count} Verified Proofs Linked
              </div>
            )}
          </div>
        )}

        {(post.skill_topic || post.resource_title) && (
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {post.skill_topic && (
              <span className="px-2.5 py-1 bg-[#00a19b]/10 text-[#00a19b] border border-[#00a19b]/20 rounded-md text-xs font-semibold">
                Skill: {post.skill_topic}
              </span>
            )}
            {post.resource_title && (
              <span className="px-2.5 py-1 bg-amber-600/10 text-amber-800 border border-amber-600/20 rounded-md text-xs font-semibold">
                📚 {post.resource_title}
              </span>
            )}
          </div>
        )}
      </div>

      {/* GitHub PR Link */}
      {post.github_pr_url && (
        <a
          href={post.github_pr_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#eee8df] border border-black/10 text-xs font-semibold text-[#00a19b] hover:border-[#00a19b]/40 transition-colors"
        >
          <GitPullRequest className="w-3.5 h-3.5" /> View Verified GitHub PR Evidence &rarr;
        </a>
      )}

      {/* Footer Social Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-black/10 text-xs text-[#7a6f67]">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 font-medium transition-colors ${liked ? "text-rose-600" : "hover:text-[#1a1410]"}`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} /> {likesCount}
          </button>
          <button className="flex items-center gap-1.5 font-medium hover:text-[#1a1410] transition-colors">
            <MessageSquare className="w-4 h-4" /> {post.comments_count}
          </button>
          <button className="flex items-center gap-1.5 font-medium hover:text-[#1a1410] transition-colors">
            <Share2 className="w-4 h-4" /> {post.shares_count}
          </button>
        </div>

        {/* Signature 🔨 Rebuild Button */}
        <button
          onClick={() => onRebuild(post.id)}
          className="px-3.5 py-1.5 bg-[#00a19b] hover:bg-[#008782] text-white font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
        >
          <Hammer className="w-3.5 h-3.5" /> 🔨 Rebuild Project
        </button>
      </div>
    </div>
  );
}
