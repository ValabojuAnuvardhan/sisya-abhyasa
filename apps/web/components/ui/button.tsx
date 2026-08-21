import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          background: "var(--mint, #00A19B)",
          color: "#ffffff",
          border: "1px solid var(--mint, #00A19B)",
        };
      case "secondary":
        return {
          background: "rgba(0, 161, 155, 0.1)",
          color: "var(--mint, #00A19B)",
          border: "1px solid rgba(0, 161, 155, 0.2)",
        };
      case "outline":
        return {
          background: "transparent",
          color: "var(--ink, #1a1410)",
          border: "1px solid rgba(0, 0, 0, 0.18)",
        };
      case "ghost":
        return {
          background: "transparent",
          color: "var(--ink, #1a1410)",
          border: "none",
        };
      case "danger":
        return {
          background: "#dc3545",
          color: "#ffffff",
          border: "1px solid #dc3545",
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return { padding: "5px 10px", fontSize: "12px", borderRadius: "6px" };
      case "lg":
        return { padding: "12px 24px", fontSize: "16px", borderRadius: "10px" };
      default:
        return { padding: "8px 16px", fontSize: "14px", borderRadius: "8px" };
    }
  };

  return (
    <button
      className={`btn ${variant} ${className}`}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.15s ease",
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
