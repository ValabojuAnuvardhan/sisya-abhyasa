import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'agent';
  content: string;
  agentName?: string;
  advisory?: string;
}

export function ChatMessage({ role, content, agentName = 'AI Companion', advisory }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full my-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] md:max-w-[78%] rounded-2xl p-4 shadow-sm text-sm transition-all ${
          isUser
            ? 'bg-[#00a19b] text-white rounded-br-none font-medium'
            : 'bg-white/80 border border-slate-200 text-[#1a1410] rounded-bl-none shadow-sm'
        }`}
      >
        <div className={`flex items-center gap-2 mb-2 pb-1.5 border-b text-xs font-semibold ${
          isUser ? 'border-white/20 text-white/90' : 'border-slate-100 text-[#7a6f67]'
        }`}>
          {isUser ? (
            <>
              <span>You</span>
              <span className="opacity-80">👤</span>
            </>
          ) : (
            <>
              <span className="text-[#00a19b] flex items-center gap-1">
                <span>{agentName.includes('Śiṣya') ? '🧠' : '⚒️'}</span>
                <span>{agentName}</span>
              </span>
            </>
          )}
        </div>

        <div className="whitespace-pre-wrap leading-relaxed text-[14.5px]">{content}</div>

        {!isUser && advisory && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-[#7a6f67] italic flex items-center gap-1">
            <span>🛡️</span>
            <span>{advisory}</span>
          </div>
        )}
      </div>
    </div>
  );
}
