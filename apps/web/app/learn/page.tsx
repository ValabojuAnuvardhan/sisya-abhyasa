"use client";

import React, { useState, useEffect } from "react";
import { SisyaChat } from "@/components/ai/SisyaChat";
import { BookOpen, Target, Sparkles, CheckCircle, AlertTriangle, Compass, Layers, Map, ArrowRight, RefreshCw, Clock, Check, Play, Circle, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";

interface SkillGap {
  skill_name: string;
  category: string;
  readiness_score: number;
  status: string;
  recommended_resource?: string;
}

interface DashboardData {
  target_role: string;
  skill_readiness_percentage: number;
  strong_skills: string[];
  skill_gaps: SkillGap[];
  continue_learning: any[];
  recommended_resources: any[];
  explore_topics: any[];
  next_action: string;
}

interface RoadmapNode {
  id: string;
  phase_number: number;
  phase_title: string;
  topic_name: string;
  why_it_matters?: string;
  prerequisite?: string;
  learning_objective?: string;
  estimated_hours: number;
  status: "not_started" | "in_progress" | "completed";
  chk_learn?: boolean;
  chk_practice?: boolean;
  chk_apply?: boolean;
  chk_demonstrate?: boolean;
  order_index: number;
}

interface RoadmapData {
  id: string;
  target_role: string;
  summary?: string;
  nodes: RoadmapNode[];
}

interface ChecklistItem {
  id: string;
  checklist_id: string;
  roadmap_node_id: string;
  project_id?: string;
  task_id?: string;
  title: string;
  description?: string;
  type: string;
  order_index: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  estimated_effort: string;
  related_skill?: string;
}

interface ChecklistData {
  id: string;
  user_id: string;
  roadmap_id: string;
  roadmap_node_id: string;
  title: string;
  items: ChecklistItem[];
}

interface LearningResourceData {
  id: string;
  roadmap_id: string;
  roadmap_node_id: string;
  checklist_item_id?: string;
  title: string;
  source: string;
  url: string;
  topic: string;
  estimated_duration?: string;
  why_recommended: string;
  related_skill: string;
  resource_type: string;
  thumbnail_url?: string;
  external_resource_id?: string;
}

interface ResourceDiscoveryPayload {
  status: "success" | "empty" | "unavailable";
  roadmap_node_id: string;
  topic: string;
  related_skill: string;
  resources: LearningResourceData[];
  error_message?: string;
}

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<
    "continue" | "recommended" | "explore" | "my_learning" | "roadmap" | "gaps" | "chat"
  >("continue");
  const [data, setData] = useState<DashboardData | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | null>(null);

  // Phase E3 Execution Checklists State
  const [checklists, setChecklists] = useState<Record<string, ChecklistData>>({});
  const [loadingChecklistNodeId, setLoadingChecklistNodeId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Phase E4 Resources State
  const [resources, setResources] = useState<Record<string, ResourceDiscoveryPayload>>({});
  const [loadingResourcesNodeId, setLoadingResourcesNodeId] = useState<string | null>(null);
  const [savedResourceIds, setSavedResourceIds] = useState<Set<string>>(new Set());

  // Phase E5 Share Learning Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareContent, setShareContent] = useState("");
  const [shareSkillTopic, setShareSkillTopic] = useState("");
  const [shareVisibility, setShareVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [shareResourceId, setShareResourceId] = useState<string | null>(null);
  const [shareResourceTitle, setShareResourceTitle] = useState<string | null>(null);
  const [shareRoadmapNodeId, setShareRoadmapNodeId] = useState<string | null>(null);
  const [shareSubmitting, setShareSubmitting] = useState(false);
  const [shareSuccessBanner, setShareSuccessBanner] = useState<string | null>(null);

  const openShareModal = (topic: string, resourceId?: string, resourceTitle?: string, nodeId?: string) => {
    setShareSkillTopic(topic);
    setShareResourceId(resourceId || null);
    setShareResourceTitle(resourceTitle || null);
    setShareRoadmapNodeId(nodeId || null);
    setShareVisibility("PUBLIC");
    setShareContent(`I just mastered ${topic} in my ${data?.target_role || "engineering"} learning roadmap!`);
    setShareModalOpen(true);
  };

  const handlePublishSharePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareContent.trim() || shareSubmitting) return;

    setShareSubmitting(true);
    try {
      await api("/network/posts", {
        method: "POST",
        body: JSON.stringify({
          content: shareContent.trim(),
          post_type: "LEARNING",
          skill_topic: shareSkillTopic || "General Learning",
          visibility: shareVisibility,
          resource_id: shareResourceId,
          roadmap_node_id: shareRoadmapNodeId
        })
      });
      setShareSuccessBanner("🎉 Learning post shared successfully to the community!");
      setShareModalOpen(false);
      setTimeout(() => setShareSuccessBanner(null), 5000);
    } catch (err) {
      console.error("Failed to publish learning post", err);
    } finally {
      setShareSubmitting(false);
    }
  };

  const fetchDashboard = () => {
    api("/learn/dashboard")
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  };

  const fetchRoadmap = () => {
    setLoadingRoadmap(true);
    api("/learn/roadmap")
      .then((r) => {
        setRoadmap(r);
        setLoadingRoadmap(false);
      })
      .catch(() => setLoadingRoadmap(false));
  };

  const fetchSavedResources = () => {
    api("/learn/resources/saved")
      .then((resList: LearningResourceData[]) => {
        if (Array.isArray(resList)) {
          setSavedResourceIds(new Set(resList.map((r) => r.id)));
        }
      })
      .catch(() => {});
  };

  const fetchResourcesForNode = (nodeId: string, refresh = false) => {
    setLoadingResourcesNodeId(nodeId);
    const endpoint = refresh ? `/learn/resources/${nodeId}/refresh` : `/learn/resources/${nodeId}`;
    const options = refresh ? { method: "POST" } : {};
    api(endpoint, options)
      .then((payload: ResourceDiscoveryPayload) => {
        if (payload) {
          setResources((prev) => ({ ...prev, [nodeId]: payload }));
        }
        setLoadingResourcesNodeId(null);
      })
      .catch(() => {
        setResources((prev) => ({
          ...prev,
          [nodeId]: {
            status: "unavailable",
            roadmap_node_id: nodeId,
            topic: "Learning Topic",
            related_skill: "Skill",
            resources: [],
            error_message: "Learning resources are temporarily unavailable."
          }
        }));
        setLoadingResourcesNodeId(null);
      });
  };

  const toggleNodeExpanded = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const isExpanded = !prev[nodeId];
      if (isExpanded) {
        if (!checklists[nodeId]) fetchChecklistForNode(nodeId);
        if (!resources[nodeId]) fetchResourcesForNode(nodeId);
      }
      return { ...prev, [nodeId]: isExpanded };
    });
  };

  const handleToggleSaveResource = (resourceId: string) => {
    const isSaved = savedResourceIds.has(resourceId);
    const method = isSaved ? "DELETE" : "POST";
    api(`/learn/resources/${resourceId}/save`, { method })
      .then(() => {
        setSavedResourceIds((prev) => {
          const next = new Set(prev);
          if (isSaved) next.delete(resourceId);
          else next.add(resourceId);
          return next;
        });
      })
      .catch((err) => console.error("Could not toggle resource save state", err));
  };

  const fetchChecklistForNode = (nodeId: string) => {
    setLoadingChecklistNodeId(nodeId);
    api(`/learn/checklists/${nodeId}`)
      .then((chk) => {
        if (chk) {
          setChecklists((prev) => ({ ...prev, [nodeId]: chk }));
        }
        setLoadingChecklistNodeId(null);
      })
      .catch((err) => {
        console.error("Could not fetch checklist", err);
        setLoadingChecklistNodeId(null);
      });
  };

  const handleChecklistItemStatusChange = (nodeId: string, itemId: string, newStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED") => {
    api(`/learn/checklists/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus })
    })
      .then((updatedItem) => {
        if (updatedItem && checklists[nodeId]) {
          setChecklists((prev) => ({
            ...prev,
            [nodeId]: {
              ...prev[nodeId],
              items: prev[nodeId].items.map((it) => (it.id === itemId ? { ...it, ...updatedItem } : it))
            }
          }));
          // Refresh dashboard & roadmap progress
          fetchDashboard();
          fetchRoadmap();
        }
      })
      .catch((err) => console.error("Could not update checklist item status", err));
  };

  const handleGenerateRoadmap = () => {
    setGeneratingRoadmap(true);
    api("/learn/roadmap/generate", { method: "POST" })
      .then((r) => {
        setRoadmap(r);
        setGeneratingRoadmap(false);
        setChecklists({});
      })
      .catch(() => setGeneratingRoadmap(false));
  };

  const handleNodeStatusChange = (nodeId: string, newStatus: string) => {
    api(`/learn/roadmap/node/${nodeId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus })
    })
      .then((updatedNode) => {
        if (roadmap) {
          setRoadmap({
            ...roadmap,
            nodes: roadmap.nodes.map((n) => (n.id === nodeId ? { ...n, ...updatedNode } : n))
          });
        }
      })
      .catch((err) => console.error("Could not update node status", err));
  };

  const handleChecklistToggle = (nodeId: string, field: "chk_learn" | "chk_practice" | "chk_apply" | "chk_demonstrate", currentValue: boolean) => {
    api(`/learn/roadmap/node/${nodeId}`, {
      method: "PATCH",
      body: JSON.stringify({ [field]: !currentValue })
    })
      .then((updatedNode) => {
        if (roadmap) {
          setRoadmap({
            ...roadmap,
            nodes: roadmap.nodes.map((n) => (n.id === nodeId ? { ...n, ...updatedNode } : n))
          });
        }
      })
      .catch((err) => console.error("Could not update checklist item", err));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === "roadmap" && !roadmap) {
      fetchRoadmap();
    }
  }, [activeTab]);

  const tabs = [
    { id: "continue", label: "Continue Learning", icon: BookOpen },
    { id: "recommended", label: "Recommended", icon: Sparkles },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "my_learning", label: "My Learning", icon: Layers },
    { id: "roadmap", label: "Learning Roadmap", icon: Map },
    { id: "gaps", label: "Skill Gaps", icon: AlertTriangle },
    { id: "chat", label: "🧠 ŚiṣyaChat", icon: Sparkles }
  ];

  return (
    <div style={{ backgroundColor: 'var(--latte)', minHeight: 'calc(100vh - 64px)', color: 'var(--ink)', padding: '32px 16px' }}>
      {/* Header & Skill Readiness Hero */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>
              📚 Learn <span className="text-xs font-sans font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(0, 161, 155, 0.12)', color: 'var(--mint)' }}>Learning Layer</span>
            </h1>
            <p className="mt-1.5 text-base" style={{ color: 'var(--muted)' }}>Develop software engineering knowledge, close skill gaps, and master core concepts.</p>
          </div>
          <div className="rounded-2xl p-4 flex items-center gap-6" style={{ background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Target Role</div>
              <div className="text-lg font-bold" style={{ color: 'var(--mint)' }}>{data?.target_role || "Backend Developer"}</div>
            </div>
            <div className="h-8 w-px" style={{ background: 'rgba(0, 0, 0, 0.1)' }} />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Skill Readiness</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${data?.skill_readiness_percentage || 72}%`, background: 'var(--mint)' }} />
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{data?.skill_readiness_percentage || 72}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "text-white shadow-sm"
                    : "hover:bg-white/40"
                }`}
                style={{
                  background: isActive ? 'var(--mint)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--muted)',
                  border: isActive ? '1px solid var(--mint)' : '1px solid transparent'
                }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "continue" && (
            <div className="space-y-6">
              <div className="rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ background: 'rgba(0, 161, 155, 0.06)', border: '1px solid rgba(0, 161, 155, 0.2)' }}>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mint)' }}>Next Recommended Action</div>
                  <h3 className="text-xl font-bold mt-1" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>{data?.next_action}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Recommended to bridge your Docker infrastructure gap for Backend Developer readiness.</p>
                </div>
                <button
                  onClick={() => setActiveTab("chat")}
                  className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shrink-0 shadow-sm"
                  style={{ background: 'var(--mint)', border: 'none' }}
                >
                  Ask ŚiṣyaChat <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(data?.continue_learning || []).map((item) => (
                  <div key={item.id} className="rounded-2xl p-6 space-y-4 transition-all hover:shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-base" style={{ color: 'var(--ink)' }}>{item.title}</h4>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0, 161, 155, 0.12)', color: 'var(--mint)' }}>{item.progress_percentage}% Done</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.08)' }}>
                      <div className="h-full rounded-full" style={{ width: `${item.progress_percentage}%`, background: 'var(--mint)' }} />
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2" style={{ color: 'var(--muted)' }}>
                      <span>Current: {item.current_lesson}</span>
                      <span>{item.estimated_minutes_left} mins left</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "recommended" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(data?.recommended_resources || []).map((res) => (
                <div key={res.id} className="rounded-2xl p-6 space-y-3 transition-all hover:shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}>
                    <span className="px-2.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(0, 161, 155, 0.12)', color: 'var(--mint)' }}>{res.type}</span>
                    <span>{res.estimated_time}</span>
                  </div>
                  <h4 className="font-bold text-lg" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>{res.title}</h4>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="text-xs font-semibold flex items-center gap-1 pt-2"
                    style={{ color: 'var(--mint)' }}
                  >
                    Discuss with ŚiṣyaChat <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "explore" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(data?.explore_topics || []).map((exp) => (
                <div key={exp.id} className="rounded-2xl p-6 space-y-2 transition-all hover:shadow-sm" style={{ background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <span className="text-xs uppercase font-semibold tracking-wider" style={{ color: 'var(--muted)' }}>{exp.category}</span>
                  <h4 className="font-bold text-lg" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>{exp.name}</h4>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="text-xs font-semibold pt-2 inline-block hover:underline"
                    style={{ color: 'var(--mint)' }}
                  >
                    Start topic explanation &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "my_learning" && (
            <div className="rounded-2xl p-8 text-center space-y-4" style={{ background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <Layers className="w-12 h-12 mx-auto" style={{ color: 'var(--mint)' }} />
              <h3 className="text-xl font-bold" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>Your Saved & Enrolled Courses</h3>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--muted)' }}>Track your active study modules, saved concepts, and quiz history here.</p>
            </div>
          )}

          {activeTab === "roadmap" && (
            <div className="rounded-2xl p-6 md:p-8 space-y-6" style={{ background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>
                    <Map className="w-5 h-5" style={{ color: 'var(--mint)' }} />
                    Personalized AI Learning Roadmap
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    Target Role: <strong style={{ color: 'var(--mint)' }}>{roadmap?.target_role || data?.target_role || "Software Developer"}</strong>
                    {roadmap?.summary ? ` • ${roadmap.summary}` : ""}
                  </p>
                </div>
                
                <button
                  onClick={handleGenerateRoadmap}
                  disabled={generatingRoadmap}
                  className="px-4 py-2 bg-[#00a19b] hover:bg-[#008782] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm self-start md:self-auto disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generatingRoadmap ? "animate-spin" : ""}`} />
                  <span>{generatingRoadmap ? "AI Generating Roadmap..." : "✨ Re-Generate AI Roadmap"}</span>
                </button>
              </div>

              {loadingRoadmap ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--mint)', borderTopColor: 'transparent' }} />
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>Fetching your personalized AI roadmap...</p>
                </div>
              ) : !roadmap || !roadmap.nodes || roadmap.nodes.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-sm italic" style={{ color: 'var(--muted)' }}>No roadmap generated yet for your target role.</p>
                  <button
                    onClick={handleGenerateRoadmap}
                    className="px-4 py-2 bg-[#00a19b] text-white rounded-xl text-xs font-bold"
                  >
                    Generate AI Learning Roadmap →
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group nodes by phase_number */}
                  {Array.from(new Set(roadmap.nodes.map((n) => n.phase_number))).sort().map((phaseNum) => {
                    const phaseNodes = roadmap.nodes.filter((n) => n.phase_number === phaseNum);
                    const phaseTitle = phaseNodes[0]?.phase_title || `Phase ${phaseNum}`;
                    const completedCount = phaseNodes.filter((n) => n.status === "completed").length;

                    return (
                      <div key={phaseNum} className="space-y-3 p-5 rounded-2xl" style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-base" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>
                            Phase {phaseNum}: {phaseTitle}
                          </h4>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(0, 161, 155, 0.1)', color: 'var(--mint)' }}>
                            {completedCount} / {phaseNodes.length} Topics Completed
                          </span>
                        </div>

                        <div className="space-y-4 pt-1">
                          {phaseNodes.map((node) => {
                            const isDone = node.status === "completed";
                            const isInProgress = node.status === "in_progress";

                            return (
                              <div
                                key={node.id}
                                className={`p-5 rounded-xl space-y-4 border transition-all ${
                                  isDone
                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                    : isInProgress
                                    ? "bg-amber-500/10 border-amber-500/30"
                                    : "bg-white/80 border-black/10"
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {isDone ? (
                                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                      ) : isInProgress ? (
                                        <Play className="w-4 h-4 text-amber-600 shrink-0 fill-amber-600" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                                      )}
                                      <span className="font-bold text-base" style={{ color: 'var(--ink)' }}>[Skill] {node.topic_name}</span>
                                      <span className="text-[11px] font-semibold text-[#7a6f67] flex items-center gap-1 bg-black/5 px-2 py-0.5 rounded-full">
                                        <Clock className="w-3 h-3" /> {node.estimated_hours} hrs
                                      </span>
                                    </div>
                                    
                                    {node.why_it_matters && (
                                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                                        💡 <strong>Why:</strong> {node.why_it_matters}
                                      </p>
                                    )}

                                    {node.prerequisite && (
                                      <p className="text-xs text-[#7a6f67]">
                                        🏷️ <strong>Prerequisite:</strong> {node.prerequisite}
                                      </p>
                                    )}
                                  </div>

                                  {/* Status Toggle Controls */}
                                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                    {(["not_started", "in_progress", "completed"] as const).map((st) => (
                                      <button
                                        key={st}
                                        onClick={() => handleNodeStatusChange(node.id, st)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                                          node.status === st
                                            ? st === "completed"
                                              ? "bg-emerald-600 text-white shadow-sm"
                                              : st === "in_progress"
                                              ? "bg-amber-600 text-white shadow-sm"
                                              : "bg-slate-700 text-white"
                                            : "bg-black/5 text-[#7a6f67] hover:bg-black/10"
                                        }`}
                                      >
                                        {st.replace("_", " ")}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Recommended Learning Breakdown */}
                                <div className="space-y-1.5 text-xs text-[#2c221e]">
                                  <div className="font-semibold text-[#7a6f67]">Recommended Learning Sequence:</div>
                                  <ol className="list-decimal list-inside space-y-1 pl-1 text-xs">
                                    <li>Core Concepts & Architectural Specifications</li>
                                    <li>Hands-on Implementation Patterns & FastAPI Integration</li>
                                    <li>Production Hardening, Benchmarking & Testing</li>
                                  </ol>
                                </div>

                                {/* Action Buttons & Interactive Checklist */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-black/5">
                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                      onClick={() => toggleNodeExpanded(node.id)}
                                      className="px-3 py-1.5 bg-[#00a19b] hover:bg-[#008782] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                      <Layers className="w-3.5 h-3.5" />
                                      <span>
                                        {expandedNodes[node.id] ? "Hide Checklist ▲" : "📋 View Execution Checklist ▼"}
                                      </span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        setChatInitialPrompt(`Teach me ${node.topic_name} with step-by-step practice exercises.`);
                                        setActiveTab("chat");
                                      }}
                                      className="px-3 py-1.5 bg-black/10 hover:bg-black/20 text-[#1a1410] text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-current" />
                                      <span>[Start Practice]</span>
                                    </button>

                                    <a
                                      href="/projects"
                                      className="px-3 py-1.5 bg-[#2c221e] hover:bg-[#1a1410] text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                      <span>[Use in Project]</span>
                                    </a>

                                    <button
                                      onClick={() => openShareModal(node.topic_name, undefined, undefined, node.id)}
                                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                      <span>🧠 [Share Learning]</span>
                                    </button>
                                  </div>

                                  {/* 4-Step Persisted Quick Checklist */}
                                  <div className="flex items-center gap-3 bg-black/5 p-2 rounded-xl text-xs flex-wrap">
                                    <span className="font-bold text-[11px] text-[#7a6f67] uppercase tracking-wider">Quick Progress:</span>
                                    {([
                                      { key: "chk_learn", label: "Learn" },
                                      { key: "chk_practice", label: "Practice" },
                                      { key: "chk_apply", label: "Apply" },
                                      { key: "chk_demonstrate", label: "Demonstrate" }
                                    ] as const).map(({ key, label }) => {
                                      const checked = Boolean(node[key]);
                                      return (
                                        <label key={key} className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold hover:text-[#00a19b] transition-colors select-none">
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => handleChecklistToggle(node.id, key, checked)}
                                            className="w-3.5 h-3.5 accent-[#00a19b] rounded cursor-pointer"
                                          />
                                          <span className={checked ? "line-through text-emerald-700 font-bold" : "text-[#1a1410]"}>
                                            {label}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* PHASE E3: EXPANDABLE AI EXECUTION CHECKLIST */}
                                {expandedNodes[node.id] && (
                                  <div className="mt-4 p-4 rounded-xl bg-white border border-black/10 space-y-4 animate-fadeIn">
                                    <div className="flex items-center justify-between border-b border-black/10 pb-2">
                                      <h5 className="font-bold text-sm text-[#1a1410] flex items-center gap-2 font-serif">
                                        <span>📋 Actionable Learning Execution Checklist</span>
                                        {checklists[node.id] && (
                                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#00a19b]/10 text-[#00a19b] font-mono">
                                            {checklists[node.id].items.filter((i) => i.status === "COMPLETED").length} / {checklists[node.id].items.length} Completed
                                          </span>
                                        )}
                                      </h5>

                                      <span className="text-[11px] text-[#7a6f67] italic">
                                        AI recommends. Student performs.
                                      </span>
                                    </div>

                                    {loadingChecklistNodeId === node.id && !checklists[node.id] ? (
                                      <div className="py-6 text-center text-xs text-[#7a6f67] flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-[#00a19b] border-t-transparent rounded-full animate-spin" />
                                        <span>Generating actionable execution checklist...</span>
                                      </div>
                                    ) : !checklists[node.id] || checklists[node.id].items.length === 0 ? (
                                      <div className="py-4 text-center text-xs text-[#7a6f67]">
                                        No checklist items available.
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {checklists[node.id].items.map((item) => {
                                          const isItemCompleted = item.status === "COMPLETED";
                                          const isItemInProgress = item.status === "IN_PROGRESS";

                                          return (
                                            <div
                                              key={item.id}
                                              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                                                isItemCompleted
                                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900"
                                                  : isItemInProgress
                                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-900"
                                                  : "bg-black/5 border-black/10 text-[#1a1410]"
                                              }`}
                                            >
                                              <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                    item.type === "LEARN" ? "bg-blue-500/15 text-blue-700" :
                                                    item.type === "PRACTICE" ? "bg-amber-500/15 text-amber-700" :
                                                    item.type === "IMPLEMENT" ? "bg-indigo-500/15 text-indigo-700" :
                                                    item.type === "TEST" ? "bg-purple-500/15 text-purple-700" :
                                                    item.type === "APPLY" ? "bg-teal-500/15 text-teal-700" :
                                                    item.type === "COMMIT" ? "bg-rose-500/15 text-rose-700" :
                                                    item.type === "PULL_REQUEST" ? "bg-cyan-500/15 text-cyan-700" :
                                                    "bg-emerald-500/15 text-emerald-700"
                                                  }`}>
                                                    {item.type}
                                                  </span>

                                                  <span className={`font-bold text-xs ${isItemCompleted ? "line-through opacity-80" : ""}`}>
                                                    {item.title}
                                                  </span>

                                                  <span className="text-[10px] text-[#7a6f67] bg-white/60 px-1.5 py-0.5 rounded border border-black/5 font-mono">
                                                    ⏱️ {item.estimated_effort}
                                                  </span>
                                                </div>

                                                {item.description && (
                                                  <p className="text-xs text-[#7a6f67] pl-1">
                                                    {item.description}
                                                  </p>
                                                )}
                                              </div>

                                              {/* Interactive Status Selector (Student-Controlled) */}
                                              <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                                                {(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const).map((st) => (
                                                  <button
                                                    key={st}
                                                    onClick={() => handleChecklistItemStatusChange(node.id, item.id, st)}
                                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                                      item.status === st
                                                        ? st === "COMPLETED"
                                                          ? "bg-emerald-600 text-white shadow-sm"
                                                          : st === "IN_PROGRESS"
                                                          ? "bg-amber-600 text-white shadow-sm"
                                                          : "bg-slate-700 text-white shadow-sm"
                                                        : "bg-white/80 text-[#7a6f67] hover:bg-white"
                                                    }`}
                                                  >
                                                    {st === "COMPLETED" ? "✓ Done" : st === "IN_PROGRESS" ? "◷ Doing" : "○ Todo"}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {/* PHASE E4: RECOMMENDED EXTERNAL LEARNING RESOURCES */}
                                    <div className="mt-4 pt-4 border-t border-black/10 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h6 className="font-bold text-xs text-[#1a1410] flex items-center gap-1.5 font-serif">
                                          <Sparkles className="w-3.5 h-3.5 text-[#00a19b]" />
                                          <span>📚 Verified External Learning Resources</span>
                                        </h6>

                                        <button
                                          onClick={() => fetchResourcesForNode(node.id, true)}
                                          className="text-[11px] font-semibold text-[#00a19b] hover:text-[#008782] transition-colors flex items-center gap-1"
                                        >
                                          <RefreshCw className={`w-3 h-3 ${loadingResourcesNodeId === node.id ? "animate-spin" : ""}`} />
                                          <span>Refresh</span>
                                        </button>
                                      </div>

                                      {loadingResourcesNodeId === node.id && !resources[node.id] ? (
                                        <div className="py-4 text-center text-xs text-[#7a6f67] flex items-center justify-center gap-2">
                                          <div className="w-3.5 h-3.5 border-2 border-[#00a19b] border-t-transparent rounded-full animate-spin" />
                                          <span>Discovering verified learning resources...</span>
                                        </div>
                                      ) : resources[node.id]?.status === "unavailable" ? (
                                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-center justify-between gap-3">
                                          <span className="font-medium">Learning resources are temporarily unavailable.</span>
                                          <button
                                            onClick={() => fetchResourcesForNode(node.id, true)}
                                            className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-[10px]"
                                          >
                                            Try Again
                                          </button>
                                        </div>
                                      ) : !resources[node.id] || !resources[node.id].resources || resources[node.id].resources.length === 0 ? (
                                        <div className="py-3 text-center text-xs italic text-[#7a6f67]">
                                          No matching learning resources found right now.
                                        </div>
                                      ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          {resources[node.id].resources.map((res) => {
                                            const isSaved = savedResourceIds.has(res.id);
                                            const isDocs = res.source === "OFFICIAL_DOCUMENTATION";

                                            return (
                                              <div
                                                key={res.id}
                                                className="p-3 rounded-xl border border-black/10 bg-black/5 hover:border-[#00a19b]/40 transition-all flex flex-col justify-between gap-2"
                                              >
                                                <div className="space-y-1.5">
                                                  <div className="flex items-center justify-between gap-2">
                                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                      isDocs ? "bg-blue-600 text-white" : "bg-red-600 text-white"
                                                    }`}>
                                                      {isDocs ? "Official Docs" : "YouTube"}
                                                    </span>

                                                    {res.estimated_duration && (
                                                      <span className="text-[10px] font-mono text-[#7a6f67] bg-white/70 px-1.5 py-0.5 rounded border border-black/5">
                                                        ⏱️ {res.estimated_duration}
                                                      </span>
                                                    )}
                                                  </div>

                                                  <h6 className="font-bold text-xs text-[#1a1410] line-clamp-2">
                                                    {res.title}
                                                  </h6>

                                                  <p className="text-[11px] text-[#7a6f67] leading-relaxed">
                                                    💡 <strong>Why:</strong> {res.why_recommended}
                                                  </p>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/5">
                                                  <div className="flex items-center gap-1.5">
                                                    <a
                                                      href={res.url}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="px-2.5 py-1 bg-[#00a19b] hover:bg-[#008782] text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1"
                                                    >
                                                      <ExternalLink className="w-3 h-3" />
                                                      <span>Open Resource</span>
                                                    </a>

                                                    <button
                                                      onClick={() => openShareModal(node.topic_name, res.id, res.title, node.id)}
                                                      className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition-all"
                                                    >
                                                      <span>🧠 Share</span>
                                                    </button>
                                                  </div>

                                                  <button
                                                    onClick={() => handleToggleSaveResource(res.id)}
                                                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all border ${
                                                      isSaved
                                                        ? "bg-amber-600 text-white border-amber-600"
                                                        : "bg-white text-[#7a6f67] border-black/10 hover:bg-black/5"
                                                    }`}
                                                  >
                                                    {isSaved ? "★ Saved" : "☆ Save"}
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "gaps" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(data?.skill_gaps || []).map((gap, i) => (
                  <div key={i} className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255, 255, 255, 0.45)', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{gap.category}</span>
                        <h4 className="font-bold text-lg mt-0.5" style={{ fontFamily: 'Georgia, serif', color: 'var(--ink)' }}>{gap.skill_name}</h4>
                      </div>
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#d97706' }}>
                        {gap.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs" style={{ color: 'var(--muted)' }}>
                        <span>Readiness</span>
                        <span>{gap.readiness_score}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0, 0, 0, 0.08)' }}>
                        <div className="h-full rounded-full" style={{ width: `${gap.readiness_score}%`, background: '#f59e0b' }} />
                      </div>
                    </div>
                    {gap.recommended_resource && (
                      <div className="text-xs pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.08)', color: 'var(--muted)' }}>
                        <span className="font-semibold" style={{ color: 'var(--mint)' }}>Recommended:</span> {gap.recommended_resource}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <SisyaChat targetRole={data?.target_role} skillGaps={(data?.skill_gaps || []).map((g) => g.skill_name)} initialPrompt={chatInitialPrompt} />
          )}
        </div>
      </div>

      {/* PHASE E5: SHARE LEARNING MODAL COMPOSER */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#f9f8f6] border border-black/10 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="text-lg font-bold text-[#1a1410] font-serif flex items-center gap-2">
                <span>🧠 Share Learning</span>
              </h3>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-xs text-[#7a6f67] hover:text-[#1a1410] font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handlePublishSharePost} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#7a6f67] uppercase tracking-wider block mb-1">
                  What did you learn?
                </label>
                <textarea
                  rows={4}
                  value={shareContent}
                  onChange={(e) => setShareContent(e.target.value)}
                  placeholder="Share a key insight, milestone, or takeaway..."
                  className="w-full bg-white border border-black/10 rounded-xl p-3 text-sm text-[#1a1410] focus:outline-none focus:border-[#00a19b]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-black/10">
                  <span className="font-bold text-[#7a6f67] block">Skill / Topic:</span>
                  <span className="font-semibold text-[#00a19b] line-clamp-1">{shareSkillTopic || "General"}</span>
                </div>

                {shareResourceTitle && (
                  <div className="bg-white p-2.5 rounded-xl border border-black/10">
                    <span className="font-bold text-[#7a6f67] block">Resource:</span>
                    <span className="font-semibold text-[#1a1410] line-clamp-1">📚 {shareResourceTitle}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-[#7a6f67] uppercase tracking-wider block mb-2">
                  Visibility
                </label>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="PUBLIC"
                      checked={shareVisibility === "PUBLIC"}
                      onChange={() => setShareVisibility("PUBLIC")}
                      className="accent-amber-600"
                    />
                    <span>🌐 Public (Community Feed)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="PRIVATE"
                      checked={shareVisibility === "PRIVATE"}
                      onChange={() => setShareVisibility("PRIVATE")}
                      className="accent-amber-600"
                    />
                    <span>🔒 Private (Only Me)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="px-4 py-2 bg-black/5 hover:bg-black/10 text-[#7a6f67] text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={shareSubmitting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>{shareSubmitting ? "Publishing..." : "Publish Post"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

