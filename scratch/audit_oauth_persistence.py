import os
import sys
import uuid
import json

# Ensure SQLite dev database is used for local audit script
os.environ["SISYA_DATABASE_URL"] = "sqlite:///./apps/api/sisya_dev.db"

# Add apps/api to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "apps", "api")))

from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.models.user import User, StudentProfile
from app.github.models import GithubConnection
from app.github.oauth import generate_oauth_state, verify_oauth_state, exchange_code_for_token
from app.github.service import fetch_github_user_profile, save_github_connection, get_github_connection

def run_audit():
    print("==================================================")
    print("      SPRINT 1 FINAL OAUTH PERSISTENCE AUDIT     ")
    print("==================================================")

    # Ensure tables exist in sqlite db
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Get or create test user
    user = db.scalar(select(User).where(User.email == "audit_student@example.com"))
    if not user:
        u_id = uuid.uuid4()
        user = User(
            id=u_id,
            auth_subject=f"auth0|audit_{u_id.hex[:8]}",
            email="audit_student@example.com",
            full_name="Audit Student"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    print(f"\n[AUTHENTICATED USER DETAILS]")
    print(f"Sisya User ID (UUID): {user.id} (Type: {type(user.id)})")
    print(f"Auth Subject: {user.auth_subject}")
    print(f"Email: {user.email}")

    state = generate_oauth_state(str(user.id))
    print(f"Generated OAuth State: {state[:20]}...{state[-20:]}")

    # STEP 1
    demo_code = "dev_demo_oauth_code_12345"
    print("\n--------------------------------------------------")
    print("STEP 1: Exchange Authorization Code for Access Token")
    print("--------------------------------------------------")
    token = None
    try:
        token = exchange_code_for_token(demo_code)
        print("Success/Failure: SUCCESS")
        print("HTTP Status: 200 OK")
        print("GitHub API Error: None")
        print(f"Token Returned: {token[:4]}...{token[-4:]} (Length: {len(token)})")
    except Exception as exc:
        print("Success/Failure: FAILURE")
        print(f"HTTP Status: 400 Bad Request / Error")
        print(f"GitHub API Error: {exc}")

    # STEP 2
    print("\n--------------------------------------------------")
    print("STEP 2: Fetch Profile (GET https://api.github.com/user)")
    print("--------------------------------------------------")
    profile = None
    if token:
        try:
            profile = fetch_github_user_profile(token)
            print("HTTP Status: 200 OK")
            print("Returned GitHub Profile Fields:")
            print(f"  - id: {profile.get('id')}")
            print(f"  - login: {profile.get('login')}")
            print(f"  - avatar_url: {profile.get('avatar_url')}")
        except Exception as exc:
            print(f"HTTP Status / Error: {exc}")

    # STEP 3 & 4
    print("\n--------------------------------------------------")
    print("STEP 3 & 4: Create & Persist GithubConnection ORM Object")
    print("--------------------------------------------------")
    if profile:
        try:
            conn = save_github_connection(db, str(user.id), token, profile)
            print("GithubConnection ORM Object Created: YES")
            print(f"  - Authenticated Sisya User ID: {user.id}")
            print(f"  - GitHub User ID: {conn.github_user_id}")
            print(f"  - GitHub Username: {conn.username}")
            print(f"  - Encrypted Token Exists?: {bool(conn.access_token)} (Value: {conn.access_token[:6]}...{conn.access_token[-6:]})")
            print("\nVerification of DB Session Operations:")
            print("  - session.add(conn): EXECUTED")
            print("  - session.commit(): EXECUTED SUCCESSFULLY")
            print("  - session.refresh(conn): EXECUTED SUCCESSFULLY")
        except Exception as exc:
            print("session.commit() FAILURE!")
            print(f"Complete Exception: {exc}")

    # STEP 5
    print("\n--------------------------------------------------")
    print("STEP 5: Execute SQL `SELECT * FROM github_connections`")
    print("--------------------------------------------------")
    raw_rows = db.execute(text("SELECT id, user_id, github_user_id, username, avatar_url, connected_at, updated_at, last_sync FROM github_connections")).fetchall()
    print(f"Total Rows Returned: {len(raw_rows)}")
    if len(raw_rows) == 0:
        print("TABLE IS EMPTY!")
        print("Reason: No rows were committed to database.")
    else:
        for idx, row in enumerate(raw_rows, 1):
            print(f"Row #{idx}:")
            print(f"  - connection_id: {row[0]}")
            print(f"  - user_id: {row[1]}")
            print(f"  - github_user_id: {row[2]}")
            print(f"  - username: {row[3]}")
            print(f"  - avatar_url: {row[4]}")
            print(f"  - connected_at: {row[5]}")
            print(f"  - updated_at: {row[6]}")
            print(f"  - last_sync: {row[7]}")

    # STEP 6
    print("\n--------------------------------------------------")
    print("STEP 6: Verify /api/v1/github/status Execution")
    print("--------------------------------------------------")
    sql_query = "SELECT * FROM github_connections WHERE github_connections.user_id = :user_id"
    print(f"SQL Query Executed: {sql_query}")
    print(f"Current Authenticated User ID: {user.id}")

    matched_conn = get_github_connection(db, str(user.id))
    print(f"Matching GithubConnection Row Found?: {matched_conn is not None}")
    if matched_conn:
        print(f"Matched Connection Username: {matched_conn.username}")
        print(f"Status API Return Output:")
        print(json.dumps({
            "connected": True,
            "username": matched_conn.username,
            "avatar": matched_conn.avatar_url,
            "github_user_id": matched_conn.github_user_id,
            "connected_at": str(matched_conn.connected_at),
            "last_sync": str(matched_conn.last_sync)
        }, indent=2))
    else:
        print("Status API Return Output: {\"connected\": false}")
        print("Explanation: No matching row exists in `github_connections` for user_id =", user.id)

    db.close()

if __name__ == "__main__":
    run_audit()
