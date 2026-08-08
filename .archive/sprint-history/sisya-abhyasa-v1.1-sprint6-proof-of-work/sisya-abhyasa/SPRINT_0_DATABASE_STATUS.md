# Sprint 0 Database Alignment Checkpoint

## Planned
PostgreSQL + Alembic foundation before authentication/onboarding.

## Implemented
- SQLAlchemy 2 declarative base and session factory.
- Alembic configured from SISYA_DATABASE_URL.
- Initial migration for users, student_profiles, skills, user_skills.
- Private-by-default profile_public=false.
- GitHub identity fields use a future immutable github_user_id; username is display metadata.
- auth_subject is provider-neutral so the auth vendor can be selected without redesigning the user table.

## Verified
- Python source compiles.
- Alembic offline SQL generation succeeds when dependencies are installed.
- No Peer Score/buildScore/internship-first fields were added.

## Deliberately deferred
- Authentication provider integration: Sprint 1.
- Projects/tasks: subsequent migrations after identity/profile baseline.
- GitHub App installation/repository tables: GitHub sprint.
- Public proof-of-work tables: evidence sprint.

## Alignment
ON TRACK with V1/V1.1. No product-scope deviation introduced by this checkpoint.
