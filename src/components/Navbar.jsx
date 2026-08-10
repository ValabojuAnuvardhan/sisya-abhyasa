import { useState } from "react";
import { NewActionModal, NotificationsDrawer, RewardsModal } from "./ActionModals";

export default function Navbar({ setLoginStep, studentStats, loggedIn, onNewItemCreated }) {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {showNewModal && (
        <NewActionModal
          onClose={() => setShowNewModal(false)}
          onSave={(item) => onNewItemCreated && onNewItemCreated(item)}
        />
      )}
      {showNotifications && (
        <NotificationsDrawer onClose={() => setShowNotifications(false)} />
      )}
      {showRewards && (
        <RewardsModal onClose={() => setShowRewards(false)} />
      )}

      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        height: 64,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Left Logo Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}>
            ☰
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "#0f172a",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 800
            }}>
              ⚙️
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
              Śiṣya Abhyāsa
            </span>
          </div>
        </div>

        {/* Right Controls Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Search Input */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "6px 12px",
            width: 240,
          }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>🔍</span>
            <input
              type="text"
              placeholder="Type / to search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 13,
                color: "#0f172a",
                width: "100%",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", fontSize: 11, color: "#94a3b8", cursor: "pointer" }}
              >
                ✕
              </button>
            )}
          </div>

          {loggedIn ? (
            <>
              {/* Action Buttons */}
              <button
                onClick={() => setShowNewModal(true)}
                className="ghost-btn"
                style={{
                  borderColor: "#00a19b",
                  color: "#00a19b",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 8
                }}
              >
                <span>+</span> New
              </button>

              {/* Icon Buttons */}
              <button
                onClick={() => setShowRewards(true)}
                style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#64748b", padding: 4 }}
              >
                🎁
              </button>

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowNotifications(true)}
                  style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#64748b", padding: 4 }}
                >
                  🔔
                </button>
                <span style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  background: "#ef4444",
                  color: "#ffffff",
                  fontSize: 9,
                  fontWeight: 800,
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  3
                </span>
              </div>

              {/* User Profile */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setLoginStep(true)}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #00A19B 0%, #0f172a 100%)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                }}>
                  {studentStats ? studentStats.avatar || "SB" : "SB"}
                </div>
              </div>
            </>
          ) : (
            <button
              onClick={() => setLoginStep(true)}
              className="mint-btn"
              style={{
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 8,
              }}
            >
              Sign In / Sign Up
            </button>
          )}
        </div>
      </header>
    </>
  );
}

