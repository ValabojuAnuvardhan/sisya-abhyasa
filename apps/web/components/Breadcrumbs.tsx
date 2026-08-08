'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Crumb = { label: string; href: string };

export default function Breadcrumbs({ items, current }: { items?: Crumb[]; current?: string }) {
  const pathname = usePathname();

  const getAutoCrumbs = (): Crumb[] => {
    if (items) return items;
    const parts = pathname.split('/').filter(Boolean);
    const crumbs: Crumb[] = [{ label: 'Home', href: '/' }];

    let acc = '';
    parts.forEach((part, idx) => {
      acc += `/${part}`;
      if (part === 'dashboard') crumbs.push({ label: 'Dashboard', href: '/dashboard' });
      else if (part === 'projects') crumbs.push({ label: 'Projects', href: '/projects' });
      else if (part === 'discover') crumbs.push({ label: 'Discover', href: '/discover' });
      else if (part === 'proof') crumbs.push({ label: 'Proof-of-Work', href: '/proof' });
      else if (part === 'tasks') crumbs.push({ label: 'Tasks', href: '/projects' });
      else if (part === 'new') crumbs.push({ label: 'Architect New', href: '/projects/new' });
      else if (part === 'onboarding') crumbs.push({ label: 'Profile Onboarding', href: '/onboarding' });
      else if (part === 'collaboration') crumbs.push({ label: 'Collaboration', href: acc });
    });
    return crumbs;
  };

  const crumbs = getAutoCrumbs();

  return (
    <nav aria-label="Breadcrumb" style={{ margin: '16px 0 8px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
      {crumbs.map((crumb, idx) => (
        <React.Fragment key={crumb.href + idx}>
          {idx > 0 && <span style={{ color: 'var(--muted)', opacity: 0.6 }}>/</span>}
          {idx === crumbs.length - 1 && !current ? (
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{crumb.label}</span>
          ) : (
            <Link href={crumb.href} style={{ color: 'var(--muted)', textDecoration: 'none' }}>
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
      {current && (
        <>
          <span style={{ color: 'var(--muted)', opacity: 0.6 }}>/</span>
          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{current}</span>
        </>
      )}
    </nav>
  );
}
