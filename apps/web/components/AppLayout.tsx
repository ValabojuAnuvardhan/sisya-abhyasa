'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { getAuthToken } from '../lib/api';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && (!!user || (typeof window !== 'undefined' && !!getAuthToken()));

  const mainLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Projects', href: '/projects', icon: '📁' },
    { label: 'Community', href: '/projects/discover', icon: '👥' },
    { label: 'GitHub Evidence', href: '/evidence', icon: '🛡️' },
    { label: 'Proof of Work', href: '/proof', icon: '🏆' },
    { label: 'Skills', href: '/career', icon: '📊' },
  ];

  const workspaceLinks = [
    { label: 'Overview', href: '/dashboard', icon: '🎛️' },
    { label: 'Kanban Tasks', href: '/projects', icon: '📱' },
    { label: 'Team Space & Chat', href: '/chat/practice', icon: '💬' },
    { label: 'Milestones', href: '/projects', icon: '🚩' },
    { label: 'Team Members', href: '/network', icon: '👥' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname === path) return true;
    return false;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', color: '#1a1410', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* TOP NAVBAR HEADER */}
      <header
        style={{
          height: 64,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: '#1a1410',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
            }}
            aria-label="Toggle Sidebar"
          >
            ☰
          </button>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#1a1410',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              ⚙️
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#1a1410', fontFamily: 'Georgia, serif', letterSpacing: '-0.3px' }}>
              Śiṣya Abhyāsa
            </span>
          </Link>
        </div>

        {/* CENTER / RIGHT SEARCH & AUTH CTAS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 280 }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Type / to search"
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: 999,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                backgroundColor: '#f1f5f9',
                fontSize: 13,
                outline: 'none',
                color: '#1a1410',
              }}
            />
          </div>

          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link
                href="/profile"
                style={{
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1a1410',
                  padding: '6px 12px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(0, 161, 155, 0.08)',
                }}
              >
                Profile & Settings
              </Link>
              <button
                onClick={logout}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.15)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#7a6f67',
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              style={{
                textDecoration: 'none',
                padding: '8px 20px',
                borderRadius: 999,
                backgroundColor: '#00a19b',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 2px 4px rgba(0, 161, 155, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Sign In / Sign Up
            </Link>
          )}
        </div>
      </header>

      {/* BODY HAS LEFT SIDEBAR + MAIN CONTENT CONTENT AREA */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside
          style={{
            width: sidebarOpen ? 240 : 0,
            transition: 'width 0.2s ease',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            padding: sidebarOpen ? '20px 12px' : 0,
            gap: 24,
          }}
        >
          {/* MAIN LINKS */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, paddingLeft: 12, marginBottom: 8 }}>
              MAIN
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {mainLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: active ? 700 : 500,
                      backgroundColor: active ? 'rgba(0, 161, 155, 0.12)' : 'transparent',
                      color: active ? '#00a19b' : '#475569',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* WORKSPACE LINKS */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, paddingLeft: 12, marginBottom: 8 }}>
              WORKSPACE
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {workspaceLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: active ? 700 : 500,
                      backgroundColor: active ? 'rgba(0, 161, 155, 0.12)' : 'transparent',
                      color: active ? '#00a19b' : '#475569',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* MAIN SCREEN AREA */}
        <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
