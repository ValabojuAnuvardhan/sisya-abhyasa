'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { getAuthToken, getUserId } from '../lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!getAuthToken());
  }, [user]);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const isLoggedIn = !!user || hasToken;
  const userId = user?.id || (typeof window !== 'undefined' ? getUserId() : null);
  const displayName = user?.full_name || user?.email || 'Student';
  const initial = displayName && displayName[0] ? displayName[0].toUpperCase() : 'S';
  const shortName = displayName.includes('@') ? displayName.split('@')[0] : displayName;

  const linkClass = (path: string) => {
    const active = isActive(path);
    return active
      ? 'text-[#00a19b] font-semibold text-sm border-b-2 border-[#00a19b] pb-1 transition-all'
      : 'text-[#7a6f67] hover:text-[#1a1410] text-sm font-medium transition-colors';
  };

  return (
    <header className="w-full bg-[#f7f2eb]/95 backdrop-blur-md border-b border-black/10 text-[#1a1410] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold font-serif text-[#1a1410] hover:text-[#00a19b] transition">
          Śiṣya Abhyāsa
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          {isLoggedIn ? (
            <>
              <Link className={linkClass('/')} href="/">
                Home
              </Link>
              <Link className={linkClass('/dashboard')} href="/dashboard">
                Dashboard
              </Link>
              <Link className={linkClass('/learn')} href="/learn">
                Learn
              </Link>
              <Link className={linkClass('/projects')} href="/projects">
                My Projects
              </Link>
              <Link className={linkClass('/career')} href="/career">
                Career Readiness
              </Link>
              <Link className={linkClass('/network')} href="/network">
                Community
              </Link>
              <Link className={linkClass('/proof')} href="/proof">
                Proof of Work
              </Link>
              {userId && (
                <Link className={linkClass(`/p/${userId}`)} href={`/p/${userId}`}>
                  My Profile ↗
                </Link>
              )}
            </>
          ) : (
            <>
              <Link className={linkClass('/discover')} href="/discover">
                Discover
              </Link>
              <Link className={linkClass('/network')} href="/network">
                Community
              </Link>
              <Link href="/auth" className="text-[#7a6f67] hover:text-[#1a1410] text-sm font-medium">
                Sign In
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/onboarding"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#eee8df] border border-black/10 hover:border-black/20 transition-all shadow-sm"
                title="Edit Profile"
              >
                <div className="w-6 h-6 rounded-full bg-[#00a19b] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {initial}
                </div>
                <span className="text-xs font-semibold text-[#1a1410]">
                  {shortName}
                </span>
              </Link>
              <button
                onClick={() => logout()}
                className="px-3.5 py-1.5 text-xs font-semibold bg-white/80 border border-black/15 hover:bg-white text-[#1a1410] rounded-lg transition-all shadow-sm"
              >
                Sign Out
              </button>
            </div>
          ) : !loading ? (
            <Link
              href="/auth"
              className="px-4 py-2 text-xs font-semibold bg-[#00a19b] hover:bg-[#008782] text-white rounded-lg transition-colors shadow-sm"
            >
              Get Started
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

