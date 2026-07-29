# Śiṣya Abhyāsa — REST API Reference Guide

**Target Version:** v1.0.0  
**Target Audience:** API Consumers, Integration Engineers, Developers  
**Document Path:** `docs/developer/api_reference.md`  

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/signup`
- **Description:** Creates a new student user account.
- **Request Body:**
  ```json
  {
    "email": "student@sisya.edu",
    "password": "SecurePassword123!",
    "full_name": "Priya"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "verification_required": true,
    "message": "Account created. Verify your email before signing in."
  }
  ```

---

### `POST /api/v1/auth/login`
- **Description:** Authenticates credentials and issues `sisya_session` HttpOnly cookie.
- **Request Body:**
  ```json
  {
    "email": "student@sisya.edu",
    "password": "SecurePassword123!"
  }
  ```
- **Response Header:** `Set-Cookie: sisya_session=...; HttpOnly; Secure; SameSite=Lax`

---

## 2. Community Marketplace Endpoints

### `GET /api/v1/community/projects`
- **Description:** Returns discoverable student projects projected with AI Match Reasons.
- **Response (200 OK):**
  ```json
  [
    {
      "id": "proj-ecosmart-101",
      "title": "EcoSmart Ocean Plastic Tracking",
      "pitch": "Build real-time satellite tracking for plastic accumulation zones.",
      "team_size": 1,
      "team_capacity": 4,
      "match_reasons": [
        "You already have Python, React, GIS",
        "You could learn FastAPI, GeoJSON"
      ]
    }
  ]
  ```

---

## 3. GitHub & Webhook Endpoints

### `POST /api/v1/github/webhooks`
- **Description:** Ingests signed GitHub App webhook payloads (`pull_request.opened`, `pull_request.closed`).
- **Headers:**
  - `X-GitHub-Event: pull_request`
  - `X-GitHub-Delivery: del-883921`
  - `X-Hub-Signature-256: sha256=d3b07384d113edec49eaa6238ad5ff00`
- **Response (202 Accepted):** `{"accepted": true, "duplicate": false}`
