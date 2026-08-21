'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getApplications, updateApplicationStatus, deleteApplication, OpportunityApplicationDTO } from '../../../lib/api';

const STAGES = ['SAVED', 'PREPARING', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'OFFER'];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<OpportunityApplicationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getApplications();
      setApplications(res.applications || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm('Remove application tracking record?')) return;
    try {
      await deleteApplication(appId);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete application');
    }
  };

  return (
    <div style={{ backgroundColor: '#f7f2eb', minHeight: 'calc(100vh - 64px)', color: '#1a1410', padding: '32px 16px' }}>
      <main style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* TOP TAB NAV */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 12 }}>
          <Link href="/career" style={{ fontSize: 14, fontWeight: 600, color: '#7a6f67', textDecoration: 'none' }}>Overview</Link>
          <Link href="/career/opportunities" style={{ fontSize: 14, fontWeight: 600, color: '#7a6f67', textDecoration: 'none' }}>Opportunities</Link>
          <Link href="/career/action-plan" style={{ fontSize: 14, fontWeight: 600, color: '#7a6f67', textDecoration: 'none' }}>Action Plan</Link>
          <Link href="/career/applications" style={{ fontSize: 14, fontWeight: 700, color: '#00a19b', borderBottom: '2px solid #00a19b', paddingBottom: 10, textDecoration: 'none' }}>Applications</Link>
        </div>

        {/* HEADER */}
        <header style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 20, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#7a6f67', textTransform: 'uppercase' }}>Tracking Engine</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: '4px 0 0 0', fontFamily: 'Georgia, serif', color: '#1a1410' }}>
              Application Tracker (Kanban)
            </h1>
          </div>
          <Link href="/career/opportunities" style={{ background: '#00a19b', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            + Explore Opportunities
          </Link>
        </header>

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
          <div style={{ height: 260, background: 'rgba(0,0,0,0.04)', borderRadius: 16 }} />
        )}

        {/* KANBAN BOARD */}
        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, overflowX: 'auto', paddingBottom: 16 }}>
            {STAGES.map((stage) => {
              const items = applications.filter((a) => a.status === stage);
              return (
                <div key={stage} style={{ background: '#eee8df', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 350 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#1a1410' }}>{stage}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(0,0,0,0.08)', padding: '2px 7px', borderRadius: 10 }}>{items.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map((app) => (
                      <div key={app.id} style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1410', fontFamily: 'Georgia, serif' }}>{app.title}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#00a19b' }}>{app.company_name}</div>
                        </div>

                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          style={{ fontSize: 11, fontWeight: 700, padding: '4px 6px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.15)', background: '#eee8df' }}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                          <span style={{ fontSize: 10, color: '#7a6f67' }}>Match: {app.match_score || 80}%</span>
                          <button onClick={() => handleDelete(app.id)} style={{ fontSize: 10, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <div style={{ fontSize: 11, color: '#7a6f67', fontStyle: 'italic', textAlign: 'center', paddingTop: 24 }}>
                        No applications
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
