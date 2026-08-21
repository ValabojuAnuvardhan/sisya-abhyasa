'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOpportunities, CareerOpportunityDTO } from '../../../lib/api';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<CareerOpportunityDTO[]>([]);
  const [query, setQuery] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getOpportunities(query, remoteFilter !== 'All' ? remoteFilter : undefined);
      setOpportunities(res.opportunities || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [remoteFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div style={{ backgroundColor: '#f7f2eb', minHeight: 'calc(100vh - 64px)', color: '#1a1410', padding: '32px 16px' }}>
      <main style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* TOP TAB NAV */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 12 }}>
          <Link href="/career" style={{ fontSize: 14, fontWeight: 600, color: '#7a6f67', textDecoration: 'none' }}>Overview</Link>
          <Link href="/career/opportunities" style={{ fontSize: 14, fontWeight: 700, color: '#00a19b', borderBottom: '2px solid #00a19b', paddingBottom: 10, textDecoration: 'none' }}>Opportunities</Link>
          <Link href="/career/action-plan" style={{ fontSize: 14, fontWeight: 600, color: '#7a6f67', textDecoration: 'none' }}>Action Plan</Link>
          <Link href="/career/applications" style={{ fontSize: 14, fontWeight: 600, color: '#7a6f67', textDecoration: 'none' }}>Applications</Link>
        </div>

        {/* HEADER */}
        <header style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6f67', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Career Intelligence Engine
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '4px 0 0 0', fontFamily: 'Georgia, serif', color: '#1a1410' }}>
              Target Opportunities & Match Intelligence
            </h1>
          </div>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 400 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by role or company..."
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.15)', background: '#fff', fontSize: 14 }}
            />
            <button type="submit" style={{ background: '#00a19b', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              Search
            </button>
          </form>
        </header>

        {/* FILTERS */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['All', 'Remote', 'Hybrid', 'Onsite'].map((f) => (
            <button
              key={f}
              onClick={() => setRemoteFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid rgba(0,0,0,0.1)',
                background: remoteFilter === f ? '#1a1410' : '#eee8df',
                color: remoteFilter === f ? '#fff' : '#1a1410',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ERROR STATE */}
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: 16, borderRadius: 12, fontSize: 14 }}>
            ⚠️ {error}
            <button onClick={loadData} style={{ marginLeft: 12, fontSize: 12, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: '#991b1b' }}>
              [Try Again]
            </button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            <div style={{ height: 180, background: 'rgba(0,0,0,0.04)', borderRadius: 16 }} />
            <div style={{ height: 180, background: 'rgba(0,0,0,0.04)', borderRadius: 16 }} />
          </div>
        )}

        {/* OPPORTUNITY CARDS */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {opportunities.length > 0 ? (
              opportunities.map((opp) => (
                <div key={opp.id} style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: '#1a1410', fontFamily: 'Georgia, serif' }}>
                          {opp.title}
                        </h3>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#00a19b', marginTop: 2 }}>
                          {opp.company_name} • <span style={{ color: '#7a6f67', fontWeight: 500 }}>{opp.location}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, padding: '4px 10px', borderRadius: 12, background: 'rgba(0, 161, 155, 0.15)', color: '#00a19b' }}>
                        {opp.match_score || 80}% Match
                      </span>
                    </div>

                    <p style={{ fontSize: 13, color: '#7a6f67', marginTop: 8, marginBottom: 12, lineHeight: 1.4 }}>
                      {opp.description}
                    </p>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(opp.required_skills || []).map((sk) => (
                        <span key={sk} style={{ fontSize: 11, background: 'rgba(0,0,0,0.06)', color: '#1a1410', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <span style={{ fontSize: 12, color: '#7a6f67', fontWeight: 600 }}>
                      {opp.employment_type}
                    </span>
                    <Link href={`/career/opportunities/${opp.id}`} style={{ fontSize: 12, fontWeight: 700, color: '#00a19b', textDecoration: 'none' }}>
                      View Match Breakdown →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: 32, textAlign: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: 16 }}>
                <p style={{ fontSize: 14, color: '#7a6f67', margin: 0, fontStyle: 'italic' }}>
                  No target opportunities match your filter yet. Search or add a custom opportunity.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
