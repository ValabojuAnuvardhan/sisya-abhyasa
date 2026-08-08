import os

def setup():
    pem_path = os.path.expanduser(r"~\Downloads\sisya-abhyasa-local-dev.2026-07-26.private-key.pem")
    if not os.path.exists(pem_path):
        print(f"Error: PEM file not found at {pem_path}")
        return

    with open(pem_path, "r", encoding="utf-8") as f:
        raw_key = f.read().strip()
    
    # Format key with single-line \n representation
    key_escaped = raw_key.replace("\r\n", "\\n").replace("\n", "\\n")

    print("\n--- GitHub App Configuration Helper ---")
    app_id = input("Enter GitHub App ID (from GitHub App General Settings): ").strip()
    client_id = input("Enter Client ID (from GitHub App General Settings): ").strip()
    client_secret = input("Enter Client Secret (from GitHub App General Settings): ").strip()
    app_slug = input("Enter App Slug [default: sisya-abhyasa-local-dev]: ").strip() or "sisya-abhyasa-local-dev"

    env_path = os.path.join(os.path.dirname(__file__), ".env")
    
    content = f"""SISYA_ENVIRONMENT=development
SISYA_DATABASE_URL=sqlite:///./sisya.db
SISYA_FRONTEND_ORIGIN=http://localhost:3000

# GitHub App (Demo 4B)
SISYA_GITHUB_APP_ID={app_id}
SISYA_GITHUB_APP_CLIENT_ID={client_id}
SISYA_GITHUB_APP_CLIENT_SECRET={client_secret}
SISYA_GITHUB_APP_SLUG={app_slug}
SISYA_GITHUB_APP_PRIVATE_KEY="{key_escaped}"
SISYA_GITHUB_WEBHOOK_SECRET=86328b5999f983d541bc89d50684efa1a041e53c3f9452938b76a3df56ef8ae7
"""

    with open(env_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    print("\n✅ Successfully configured apps/api/.env with your GitHub App credentials and PEM key!")

if __name__ == "__main__":
    setup()
