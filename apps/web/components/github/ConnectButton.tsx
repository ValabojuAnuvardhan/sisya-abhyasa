'use client';

import React from 'react';

interface ConnectButtonProps {
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  loading?: boolean;
}

export function ConnectButton({
  connected,
  onConnect,
  onDisconnect,
  loading = false,
}: ConnectButtonProps) {
  if (loading) {
    return (
      <button
        disabled
        className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-700 text-gray-300 opacity-75 cursor-not-allowed flex items-center space-x-2"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          className="animate-spin text-white"
          style={{ width: 16, height: 16, maxWidth: 16, maxHeight: 16, objectFit: 'contain', flexShrink: 0 }}
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>Connecting...</span>
      </button>
    );
  }

  if (connected) {
    return (
      <button
        onClick={onDisconnect}
        className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-700 text-red-200 transition-colors flex items-center space-x-2"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="text-red-400"
          style={{ width: 16, height: 16, maxWidth: 16, maxHeight: 16, objectFit: 'contain', flexShrink: 0 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Disconnect</span>
      </button>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="px-5 py-2.5 text-sm font-medium rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white shadow-md hover:shadow-lg transition-all flex items-center space-x-2.5 cursor-pointer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
    >
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        style={{ width: 20, height: 20, maxWidth: 20, maxHeight: 20, objectFit: 'contain', flexShrink: 0, fill: 'currentColor' }}
      >
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
      <span>Connect GitHub</span>
    </button>
  );
}
