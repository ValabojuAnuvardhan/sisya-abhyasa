import React from 'react';
import Link from 'next/link';

interface PageBackProps {
  href: string;
  label?: string;
}

export default function PageBack({ href, label = 'Back' }: PageBackProps) {
  return (
    <div className="pageBackWrapper">
      <Link href={href} className="pageBackLink" aria-label={`Navigate back to ${label}`}>
        <span aria-hidden="true">←</span> {label}
      </Link>
    </div>
  );
}
