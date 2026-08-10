'use client';

import React, { useEffect, useState } from 'react';
import {
  GitHubStatusResponse,
  ProjectRepositoryResponse,
  DashboardAnalyticsResponse,
  getGitHubStatus,
  disconnectGitHub,
  refreshGitHubConnection,
  connectGitHub,
  getProjectLinkedRepository,
  getUserProjects,
  syncProjectRepository,
  getDashboardAnalytics,
  ProjectItem,
} from '@/lib/api';

import { GitHubStatusCard } from './GitHubStatusCard';
import { LinkedRepositoryBanner } from './LinkedRepositoryBanner';
import { EvidenceTimeline } from './EvidenceTimeline';
import { RecentActivityFeed } from './RecentActivityFeed';
import { RepositorySummarySidebar } from './RepositorySummarySidebar';
import { ProjectRepoSelectorModal } from './ProjectRepoSelectorModal';
import { AIVerificationCard } from './AIVerificationCard';

export function GitHubEvidence() {
  const [status, setStatus] = useState<GitHubStatusResponse | null>(null);
  const [linkedData, setLinkedData] = useState<ProjectRepositoryResponse | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalyticsResponse | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await getGitHubStatus();
      setStatus(data);
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (projectId: string) => {
    if (!projectId) return;
    try {
      const data = await getDashboardAnalytics(projectId);
      setAnalytics(data);
    } catch {
      setAnalytics(null);
    }
  };

  const fetchProjectsAndLinkedRepo = async () => {
    try {
      const list = await getUserProjects();
      setProjects(list);
      if (list.length > 0) {
        const pId = list[0].id;
        setSelectedProjectId(pId);
        const repoData = await getProjectLinkedRepository(pId);
        setLinkedData(repoData);
        fetchAnalytics(pId);
      }
    } catch {
      setLinkedData({ linked: false });
      setAnalytics(null);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchProjectsAndLinkedRepo();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      getProjectLinkedRepository(selectedProjectId).then(setLinkedData).catch(() => setLinkedData({ linked: false }));
      fetchAnalytics(selectedProjectId);
    }
  }, [selectedProjectId]);

  const handleConnect = async () => {
    setActionLoading(true);
    try {
      const res = await connectGitHub();
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start GitHub authentication.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your GitHub account?')) return;
    setActionLoading(true);
    try {
      await disconnectGitHub();
      setStatus({ connected: false });
      setLinkedData({ linked: false });
      setAnalytics(null);
    } catch (err: any) {
      alert(err.message || 'Failed to disconnect GitHub.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    setActionLoading(true);
    try {
      const data = await refreshGitHubConnection();
      setStatus(data);
      if (selectedProjectId) {
        const repoData = await getProjectLinkedRepository(selectedProjectId);
        setLinkedData(repoData);
        await fetchAnalytics(selectedProjectId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to refresh connection.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncRepository = async () => {
    if (!selectedProjectId) return;
    setActionLoading(true);
    try {
      await syncProjectRepository(selectedProjectId);
      const repoData = await getProjectLinkedRepository(selectedProjectId);
      setLinkedData(repoData);
      await fetchAnalytics(selectedProjectId);
    } catch {
      if (selectedProjectId) {
        const repoData = await getProjectLinkedRepository(selectedProjectId);
        setLinkedData(repoData);
        await fetchAnalytics(selectedProjectId);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Page Title & Breadcrumbs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Projects</span>
          <span>›</span>
          <span style={{ color: '#374151', fontWeight: '600' }}>{currentProject?.title || 'Student Task Manager'}</span>
          <span>›</span>
          <span style={{ color: '#111827', fontWeight: '600' }}>GitHub Evidence</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0 }}>
              GitHub Evidence
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0 0' }}>
              Track your contributions, pull requests, and build your verified project experience.
            </p>
          </div>
        </div>
      </div>

      {/* Top GitHub Connection Status Card */}
      <GitHubStatusCard
        status={status}
        loading={loading}
        actionLoading={actionLoading}
        onRefresh={handleRefresh}
        onDisconnect={handleDisconnect}
        onConnect={handleConnect}
      />

      {/* Linked Repository Banner */}
      <LinkedRepositoryBanner
        linkedData={linkedData}
        projectName={currentProject?.title}
        actionLoading={actionLoading}
        onSync={handleSyncRepository}
        onChangeRepository={() => setIsModalOpen(true)}
        syncHealth={analytics?.sync_health}
        overview={analytics?.overview}
      />

      {/* 2-Column Main Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column (Timeline, AI Verification & Activity) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          <AIVerificationCard projectId={selectedProjectId} />
          <EvidenceTimeline projectId={selectedProjectId} overview={analytics?.overview} branches={analytics?.branches} />
          <RecentActivityFeed projectId={selectedProjectId} overview={analytics?.overview} latestCommit={analytics?.commits.latest_commit} />
        </div>

        {/* Right Column (Sidebar Summary & Skills Earned) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <RepositorySummarySidebar projectId={selectedProjectId} overview={analytics?.overview} />
        </div>
      </div>

      {/* Repository Selection & Discovery Overlay Modal */}
      <ProjectRepoSelectorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (selectedProjectId) {
            getProjectLinkedRepository(selectedProjectId).then(setLinkedData).catch(() => {});
            fetchAnalytics(selectedProjectId);
          }
        }}
      />
    </div>
  );
}
