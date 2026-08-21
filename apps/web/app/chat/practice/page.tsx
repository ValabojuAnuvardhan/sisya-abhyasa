'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { askAbhyasBot, getUserProjects, ProjectItem } from '@/lib/api';
import { ChatMessage } from '@/components/ai/ChatMessage';

interface Msg {
  role: 'user' | 'agent';
  content: string;
  agentName?: string;
  advisory?: string;
}

export default function AbhyasBotPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'agent',
      agentName: 'AbhyāsBot',
      content:
        "Greetings! I am AbhyāsBot — your AI practice companion on Śiṣya Abhyāsa. I know your current project, milestones, tasks, and GitHub activity. Ask me how to execute or unblock your current task, and I will give you concrete workspace guidance inside your project.",
      advisory: 'AI-generated practice guidance — advisory only',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserProjects()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          setSelectedProjectId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  async function handleSend(textToSend?: string) {
    const question = (textToSend || input).trim();
    if (!question || loading) return;

    if (!textToSend) setInput('');

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question },
    ]);
    setLoading(true);

    try {
      const res = await askAbhyasBot(question, undefined, selectedProjectId || undefined);
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          agentName: 'AbhyāsBot',
          content: res.answer,
          advisory: res.advisory,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          agentName: 'AbhyāsBot',
          content: `Unable to connect to AbhyāsBot (${err?.message || 'Server error'}). Please make sure the backend server is running.`,
          advisory: 'Connection error',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#e4ddd3] text-[#1a1410] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-black/10 bg-[#e4ddd3]/90 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-[#7a6f67] hover:text-[#1a1410] transition-colors flex items-center gap-1 bg-white/50 px-3 py-1.5 rounded-full border border-black/10 shadow-sm"
          >
            ← Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-black/10" />
          <h1 className="text-lg font-bold text-[#1a1410] flex items-center gap-2 font-serif">
            <span>⚒️ AbhyāsBot</span>
            <span className="text-xs bg-[#00a19b]/10 text-[#00a19b] border border-[#00a19b]/30 px-2 py-0.5 rounded-full font-sans font-semibold">
              PRACTICE COMPANION
            </span>
          </h1>
        </div>

        {/* Project Selector */}
        {projects.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#7a6f67] font-medium hidden sm:inline">Active Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-white border border-black/15 text-[#1a1410] font-semibold rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#00a19b]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col">
        {/* Suggested Prompts */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-[#7a6f67] self-center mr-1">Suggested Actions:</span>
          {[
            'How do I breakdown my current milestone into tasks?',
            'What is the next step to complete my active task?',
            'Help me debug my API error response',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-xs bg-white/70 border border-black/10 hover:border-[#00a19b] text-[#1a1410] font-medium px-3 py-1.5 rounded-lg transition-all text-left shadow-sm"
            >
              🛠️ {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white/70 border border-black/10 rounded-2xl p-4 md:p-6 overflow-y-auto min-h-[420px] max-h-[60vh] shadow-sm">
          {messages.map((m, idx) => (
            <ChatMessage
              key={idx}
              role={m.role}
              content={m.content}
              agentName={m.agentName}
              advisory={m.advisory}
            />
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-[#7a6f67] text-xs my-3 p-3 bg-white border border-black/10 rounded-xl w-fit shadow-sm">
              <span className="animate-spin text-[#00a19b]">⚒️</span>
              <span>AbhyāsBot is retrieving workspace context...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-4 flex gap-3"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AbhyāsBot for workspace assistance... (e.g., How do I write pytest fixtures for user registration?)"
            className="flex-1 bg-white border border-black/15 focus:border-[#00a19b] rounded-xl p-3 text-sm text-[#1a1410] placeholder-[#7a6f67] outline-none resize-none min-h-[52px] max-h-[120px] shadow-sm"
            rows={1}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#00a19b] hover:bg-[#008782] disabled:opacity-50 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-2 self-end shadow-sm"
          >
            <span>Build</span>
            <span>→</span>
          </button>
        </form>
      </main>
    </div>
  );
}
