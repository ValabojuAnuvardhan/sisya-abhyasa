# Śiṣya Abhyāsa — Learning Operating System Architecture & Sprint 5 Plan

Build the **Learning Activity & Evidence Foundation** for Śiṣya Abhyāsa as the foundational layer of the Learning Operating System.

> [!IMPORTANT]
> **Core Architectural Hierarchy**:
> ```
> Learning Activity ➔ Artifact ➔ Evidence ➔ Verification ➔ Capability ➔ Projection ➔ AI Intelligence
> ```
> 1. **Learning Activity**: What happened (Task completed, PR created, Code review given, Quiz passed, AI session completed).
> 2. **Artifact**: Raw output (`CanonicalArtifact` via `GithubAdapter`, `TaskAdapter`, `MentorAdapter`).
> 3. **Evidence**: Curated, deduplicated (`IdentityService`), and linked (`RelationshipBuilder`) proof.
> 4. **Verification**: Workflow credibility engine (Sprint 6).
> 5. **Capability**: Proven capabilities (`SkillEngine`, `TrustEngine`, Leadership, Architecture) (Sprint 7).
> 6. **Projection**: Audience-specific read models (`StudentProjection`, `RecruiterProjection`) (Sprint 8).
> 7. **AI Intelligence**: Reasoning layer (`AIMentor`, `LivingResume`, `AIRecruiterAssistant`) (Sprint 9).

---

## The 5 Decoupled Platform Domains

```
1. LEARNING DOMAIN     ➔ Projects, Tasks, Milestones, Learning Activities, Teams
2. EVIDENCE DOMAIN     ➔ Provider Registry, Artifact Store, Evidence Store, Pipeline, Event Bus
3. CAPABILITY DOMAIN   ➔ Skill Engine, Experience Engine, Trust Engine, Capability Graph
4. PROJECTION DOMAIN   ➔ Projection Worker, Student View, Recruiter Platform
5. INTELLIGENCE DOMAIN ➔ AI Mentor, Living Resume ("Ask AI"), AI Recruiter Assistant
```

---

## Sprint 5 Scope — Learning Activity & Evidence Foundation

```
apps/api/app/github/evidence_graph/
├── __init__.py
├── registry.py        # ProviderRegistry (provider, version, capabilities, adapter)
├── canonical.py       # CanonicalArtifact Data Standard
├── adapter.py         # BaseSourceAdapter, GithubAdapter (v1), LearningActivityAdapter (v1)
├── identity.py        # IdentityService & HashStrategy (Deduplication)
├── context.py         # ProcessingContext (request_id, project_id, student_id, trace_id)
├── pipeline.py        # Multi-Stage ProcessingPipeline (Normalize -> Validate -> Enrich -> Deduplicate -> Persist -> Relate -> Promote -> Emit)
├── rules.py           # Priority-Based RelationshipRule plugins (GithubRule, TaskRule, MentorRule)
├── builder.py         # RelationshipBuilder Engine
├── events.py          # Domain Event Bus & Immutable Event Store
├── projections.py     # CQRS ProjectionWorker, Read Repositories, Read Models
├── commands.py        # Write Commands (CollectArtifactsCommand, CreateRelationshipCommand, etc.)
├── queries.py         # Read Queries (GetTaskEvidenceQuery, GetProjectEvidenceQuery)
├── service.py         # EvidencePlatformService Orchestrator
├── validators.py      # Security & Isolation Validators
├── models.py          # LearningActivityRecord, ArtifactRecord, EvidenceRecord, EvidenceLink, EvidenceEvent Database Tables
├── schemas.py         # Infrastructure Pydantic DTOs
└── routes.py          # Infrastructure REST API Endpoints
```

---

## Proposed Component Breakdown for Sprint 5

### 1. Learning Activity Foundation (`models.py`, `adapter.py`)
- `LearningActivityRecord`: Core activity entity (`id`, `project_id`, `student_id`, `activity_type`, `source_provider`, `activity_data_json`, `timestamp`).
- `LearningActivityAdapter`: Converts internal Śiṣya actions (`task_created`, `task_completed`, `quiz_passed`, `mentor_review`) into `CanonicalArtifact` objects.

### 2. Provider Registry & Canonical Standard (`registry.py`, `canonical.py`)
- `ProviderCapabilities`: Capability contracts (`supports_webhooks`, `supports_reviews`, `supports_prs`, `supports_branches`, `supports_commits`, `supports_deployments`, `supports_ci`, `supports_files`).
- `ProviderRegistry`: Registry mapping provider keys and version strings (e.g. `("github", "v1")`, `("sisya", "v1")`, `("gitlab", "v1")`) to capabilities and adapters.
- `CanonicalArtifact`: Raw artifact schema (`schema_version`, `provider`, `version`, `artifact_type`, `provider_entity_id`, `actor`, `timestamp`, `payload`, `metadata`).

### 3. Identity Service & Dual Storage (`identity.py`, `models.py`)
- `HashStrategy`: Deterministic SHA-256 hash generator.
- `ArtifactStore` (`artifact_records`): Raw artifact store for future AI reprocessing.
- `EvidenceStore` (`evidence_records`): Promoted evidence store.

### 4. Processing Pipeline (`pipeline.py`)
- `ProcessingPipeline`: 8 isolated stages receiving `ProcessingContext`:
  1. `NormalizeStage`
  2. `ValidateStage`
  3. `EnrichStage`
  4. `DeduplicateStage`
  5. `PersistArtifactStage`
  6. `RelationshipStage`
  7. `PromoteToEvidenceStage`
  8. `EmitEventStage`

### 5. Priority-Based Relationship Builder (`rules.py`, `builder.py`)
- `RelationshipRule`: Declares `priority: int`, `supports()`, `build()`.
- `GithubRule` (Priority 10), `TaskRule` (Priority 20), `MentorRule` (Priority 30).

### 6. Event Bus & CQRS Projections (`events.py`, `commands.py`, `queries.py`, `projections.py`)
- `EventBus`: Decoupled event bus emitting immutable `EvidenceEvent`s.
- `ProjectionWorker`: Listens to events and updates read models (`TaskProjection`, `ProjectProjection`).
- Write Commands & Handlers (`CollectArtifactsCommand`, `CreateRelationshipCommand`, `VerifyEvidenceCommand`, `RejectEvidenceCommand`).
- Read Queries & Repositories (`GetTaskEvidenceQuery`, `GetProjectEvidenceQuery`).

---

## Infrastructure REST API (`routes.py`)

Mounted under `/api/v1/evidence-graph`:
- `POST /api/v1/evidence-graph/collect/{project_id}` ➔ Executes `CollectArtifactsCommand` pipeline.
- `GET /api/v1/evidence-graph/task/{task_id}` ➔ Executes `GetTaskEvidenceQuery` via `TaskProjectionRepository`.
- `GET /api/v1/evidence-graph/project/{project_id}` ➔ Executes `GetProjectEvidenceQuery` via `ProjectProjectionRepository`.
- `POST /api/v1/evidence-graph/relationship` ➔ Executes `CreateRelationshipCommand`.
- `POST /api/v1/evidence-graph/record/{evidence_id}/verify` ➔ Executes `VerifyEvidenceCommand`.
- `POST /api/v1/evidence-graph/record/{evidence_id}/reject` ➔ Executes `RejectEvidenceCommand`.

---

## Verification & Quality Strategy (`apps/api/tests/test_evidence_graph.py`)

1. **Learning Activity & Adapter Tests**:
   - Ingestion of internal `LearningActivityRecord` and transformation into `CanonicalArtifact`.
   - `ProviderRegistry` versioning and capabilities check.
2. **Pipeline & Dual Store Tests**:
   - 8-stage `ProcessingPipeline` execution with `ProcessingContext`.
   - `ArtifactStore` raw persistence & `EvidenceStore` promotion.
3. **CQRS & Event Bus Tests**:
   - Priority-based `RelationshipBuilder` execution.
   - `EventBus` publish/subscribe and `ProjectionWorker` read repository updates.
4. **Regression Gate**:
   - `python -m pytest tests/` (100% PASS).
   - `npm run lint` (0 warnings / 0 errors).
   - `npx next build` (Successful compilation).
