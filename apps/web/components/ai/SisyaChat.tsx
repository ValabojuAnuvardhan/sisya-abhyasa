"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, HelpCircle, BookOpen, Lightbulb } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendedTopics?: string[];
  followUpQuiz?: string;
}

interface SisyaChatProps {
  targetRole?: string;
  skillGaps?: string[];
  initialPrompt?: string | null;
}

export function SisyaChat({ targetRole = "Backend Developer", skillGaps = ["Docker", "Redis", "System Design"], initialPrompt }: SisyaChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I am **ŚiṣyaChat**, your dedicated AI Learning Companion.\n\nI can help you master backend concepts, explain complex architectures, diagnose your skill gaps for **${targetRole}**, and quiz your knowledge.\n\nHow can I help your learning today?`,
      recommendedTopics: ["FastAPI Dependency Injection", "Database Session Scoping", "Docker Networking Basics"]
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSentInitialRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt && !hasSentInitialRef.current) {
      hasSentInitialRef.current = true;
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const data = await api("/learn/chat", {
        method: "POST",
        body: JSON.stringify({
          message: query,
          target_role: targetRole,
          skill_gaps: skillGaps,
          chat_history: messages.map((m) => ({ role: m.role, content: m.content }))
        })
      });
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "I'm here to explain software concepts!",
        recommendedTopics: data.recommended_topics || [],
        followUpQuiz: data.follow_up_quiz
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I ran into a temporary connection issue. However, I can explain that dependency injection in FastAPI decouples configuration and DB sessions from your endpoints using `Depends()`. Would you like a code sample?"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 flex items-center gap-2">
              🧠 ŚiṣyaChat <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-normal">Learn Mode</span>
            </h3>
            <p className="text-xs text-slate-400">Target Role: {targetRole} • Concept & Gap Diagnosis Agent</p>
          </div>
        </div>
        <div className="text-xs text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          No Task Execution • Pure Learning
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[80%] rounded-2xl p-4 space-y-3 ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-800/80 border border-slate-700/60 text-slate-200"}`}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>

              {msg.recommendedTopics && msg.recommendedTopics.length > 0 && (
                <div className="pt-2 border-t border-slate-700/50 space-y-2">
                  <div className="text-xs font-medium text-indigo-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Recommended Concept Topics:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {msg.recommendedTopics.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(`Explain ${topic}`)}
                        className="text-xs px-2.5 py-1 rounded-md bg-slate-900/60 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {msg.followUpQuiz && (
                <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-xs text-indigo-200 flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-indigo-300">Quiz Opportunity:</span> {msg.followUpQuiz}
                  </div>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-4 items-center text-slate-400 text-sm">
            <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask ŚiṣyaChat to explain a concept, quiz you, or diagnose a skill..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
