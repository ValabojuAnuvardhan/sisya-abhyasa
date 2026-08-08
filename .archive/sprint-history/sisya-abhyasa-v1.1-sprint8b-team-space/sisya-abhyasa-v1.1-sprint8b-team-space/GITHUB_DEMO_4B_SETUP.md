# Demo 4B — GitHub App local setup

This checkpoint needs a real GitHub App and a public HTTPS tunnel to the local FastAPI server because GitHub cannot deliver webhooks to localhost.

## 1. Expose FastAPI
Run the API on port 8000, then use a trusted development tunnel (for example the tunnel already available in your development environment). Your public API base must be HTTPS.

Webhook URL:
`<PUBLIC_API_BASE>/api/v1/github/webhooks`

## 2. Create a development GitHub App
In GitHub Developer settings, create a new GitHub App dedicated to local development.

Recommended settings for this checkpoint:
- Homepage URL: `http://localhost:3000`
- Callback URL: `<PUBLIC_API_BASE>/api/v1/github/identity/callback`
- Setup URL: `http://localhost:3000/projects` (the UI can be reopened on the target project after installation)
- Webhook: Active
- Webhook URL: `<PUBLIC_API_BASE>/api/v1/github/webhooks`
- Webhook secret: generate a long random value and put the same value in `SISYA_GITHUB_WEBHOOK_SECRET`.

Repository permissions (least privilege for this checkpoint):
- Metadata: Read-only (required by GitHub)
- Contents: Read-only
- Pull requests: Read-only

Subscribe to events:
- Push
- Pull request

Install the App only on a test repository, not all repositories.

## 3. Configure server environment
Copy the GitHub App values into `apps/api/.env` or the environment used to run FastAPI:
- `SISYA_GITHUB_APP_ID`
- `SISYA_GITHUB_APP_CLIENT_ID`
- `SISYA_GITHUB_APP_CLIENT_SECRET`
- `SISYA_GITHUB_APP_SLUG`
- `SISYA_GITHUB_APP_PRIVATE_KEY`
- `SISYA_GITHUB_WEBHOOK_SECRET`

Never put these values in `apps/web` or any `NEXT_PUBLIC_*` variable.

## 4. Apply migration
From `apps/api` run:
`alembic upgrade head`

## 5. Connect a repository
Open an existing project → GitHub Evidence → Install GitHub App. After installation, GitHub's URL/setup response contains an `installation_id`. Enter that numeric ID and `owner/repository` in the project workspace. The backend uses an installation token to verify that the App can actually access that repository before saving the connection.

## 6. Verify student GitHub identity
Click `Verify my GitHub identity`. Authorize the GitHub App user flow. The backend stores GitHub's immutable numeric user ID. This is what allows PR evidence to be attributed to the correct student without guessing by username.

## 7. Evidence acceptance test
- Create or update a branch in the connected repository and push it.
- Open a real pull request.
- Reload GitHub Evidence in the project workspace.
- The PR must appear with its real GitHub URL/state/actor.
- If identity verification was completed for the PR author, it must show `Mapped to student`.
- Link the PR to one project task and reload; the link must persist.
- Merge the PR on GitHub, then reload after the webhook arrives; it must show `Merged`.
- Redelivering the same webhook must not create a second PR/commit record.

If any step fails, capture the API error and GitHub App webhook delivery response before changing architecture.
