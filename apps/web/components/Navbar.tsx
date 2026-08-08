'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="shell nav" role="banner" style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
      <Link className="brand" href={user ? '/dashboard' : '/'} aria-label="Śiṣya Abhyāsa Home">
        Śiṣya Abhyāsa
      </Link>
      <nav className="navlinks" aria-label="Main Navigation">
        {user ? (
          <>
            <Link className={isActive('/dashboard') ? 'nav-active' : ''} href="/dashboard">
              Dashboard
            </Link>
            <Link className={isActive('/projects') ? 'nav-active' : ''} href="/projects">
              My Projects
            </Link>
            <Link className={isActive('/projects/discover') ? 'nav-active' : ''} href="/projects/discover">
              Community
            </Link>
            <Link className={isActive('/proof') ? 'nav-active' : ''} href="/proof">
              Proof-of-Work
            </Link>
            <Link className={isActive('/github') ? 'nav-active' : ''} href="/github">
              GitHub OAuth
            </Link>
          </>
        ) : (
          <>
            <Link className={isActive('/discover') ? 'nav-active' : ''} href="/discover">
              Discover
            </Link>
            <Link className={isActive('/projects/discover') ? 'nav-active' : ''} href="/projects/discover">
              Community
            </Link>
            <Link href="/auth">Sign In</Link>
          </>
        )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {!loading && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/onboarding" className="user-profile-badge" title="Edit Profile">
              <span className="avatar-initial">{(user.full_name || user.email)[0].toUpperCase()}</span>
              <span className="user-name-text" style={{ fontSize: 13, fontWeight: 600 }}>
                {user.full_name || user.email.split('@')[0]}
              </span>
            </Link>
            <button className="btn secondary" onClick={() => logout()} style={{ padding: '6px 12px', fontSize: 13 }}>
              Sign Out
            </button>
          </div>
        ) : !loading ? (
          <Link className="btn primary" href="/auth" style={{ padding: '8px 16px', fontSize: 14 }}>
            Get Started
          </Link>
        ) : null}
      </div>
    </header>
  );
}
