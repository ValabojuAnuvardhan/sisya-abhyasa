'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { askSisyaChat } from '@/lib/api';
import { ChatMessage } from '@/components/ai/ChatMessage';
import Breadcrumbs from '@/components/Breadcrumbs';

interface Msg {
  role: 'user' | 'agent';
  content: string;
  agentName?: string;
  advisory?: string;
}

export default function SisyaChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'agent',
      agentName: 'ŚiṣyaChat',
      content:
        "Hello! I am ŚiṣyaChat — your AI learning companion on Śiṣya Abhyāsa. I understand your target role, skill gaps, and learning roadmap. Ask me any conceptual question, and I will teach it at your level without simply writing the code for you. What concept would you like to master today?",
      advisory: 'AI-generated learning guidance — verify from official documentation',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const res = await askSisyaChat(question, {});
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          agentName: 'ŚiṣyaChat',
          content: res.answer,
          advisory: res.advisory,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          agentName: 'ŚiṣyaChat',
          content: `Unable to connect to ŚiṣyaChat (${err?.message || 'Server error'}). Please make sure the backend server is running.`,
          advisory: 'Connection error',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#e4ddd3] text-[#1a1410] flex flex-col font-sans">
      {/* Top Navbar Header */}
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
            <span>🧠 ŚiṣyaChat</span>
            <span className="text-xs bg-[#00a19b]/10 text-[#00a19b] border border-[#00a19b]/30 px-2 py-0.5 rounded-full font-sans font-semibold">
              LEARN COMPANION
            </span>
          </h1>
        </div>

        <div className="text-xs font-medium text-[#7a6f67] hidden sm:block">
          Target Role & Skill-Gap Aware
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col">
        {/* Quick Prompts */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#7a6f67] mr-1">Suggested:</span>
          {[
            'Explain FastAPI Dependency Injection',
            'How do B-Tree indexes speed up SQL queries?',
            'What is the difference between SQL vs NoSQL?',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-xs bg-white/60 hover:bg-white border border-black/10 hover:border-[#00a19b] text-[#1a1410] hover:text-[#00a19b] px-3.5 py-1.5 rounded-full transition-all text-left font-medium shadow-sm"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 bg-white/30 border border-black/10 rounded-2xl p-4 md:p-6 overflow-y-auto min-h-[420px] max-h-[60vh] backdrop-blur-sm shadow-inner">
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
            <div className="flex items-center gap-2 text-[#7a6f67] text-xs my-3 p-3 bg-white/70 border border-black/10 rounded-xl w-fit shadow-sm">
              <span className="animate-spin text-[#00a19b]">🧠</span>
              <span className="font-medium">ŚiṣyaChat is analyzing concepts...</span>
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
            placeholder="Ask ŚiṣyaChat a conceptual question... (e.g., How does JWT verification work?)"
            className="flex-1 bg-white/70 border border-black/15 focus:border-[#00a19b] focus:ring-1 focus:ring-[#00a19b] rounded-xl p-3 text-sm text-[#1a1410] placeholder-[#7a6f67] outline-none resize-none min-h-[52px] max-h-[120px] shadow-sm font-sans"
            rows={1}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#00a19b] hover:bg-[#008782] disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 self-end shadow-md"
          >
            <span>Ask</span>
            <span>→</span>
          </button>
        </form>
      </main>
    </div>
  );
}
