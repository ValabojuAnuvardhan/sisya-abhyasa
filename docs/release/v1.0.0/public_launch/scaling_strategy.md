# Śiṣya Abhyāsa — Infrastructure & Application Scaling Strategy

**Target Release:** `v1.0.0`  
**Document Path:** `docs/release/v1.0.0/public_launch/scaling_strategy.md`  

---

## Capacity Scaling Tiers (100 to 100,000 Users)

| Active User Tier | Application Pod Replicas | Database Tier / Connections | CDN & Storage Strategy | Estimated Monthly Infra Cost |
| :--- | :---: | :--- | :--- | :---: |
| **100 Users (Pilot Baseline)** | 2 FastAPI Workers | PostgreSQL 16 (20 Conn Pool) | AWS CloudFront S3 Bucket | **$120 / Month** |
| **1,000 Users (Public Launch)**| 4 FastAPI Workers | PostgreSQL 16 (50 Conn Pool) | S3 CDN Cache Purge Enabled | **$350 / Month** |
| **10,000 Users (University Growth)**| 12 FastAPI Workers | Primary + 2 Read Replicas | Redis Cluster + Global CDN | **$1,450 / Month** |
| **100,000 Users (Global Scale)**| Auto-scale (30–60 Pods) | Aurora PostgreSQL Cluster | Edge Multi-Region CDN | **$6,800 / Month** |
