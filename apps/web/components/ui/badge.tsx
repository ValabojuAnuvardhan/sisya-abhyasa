import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning";
}

export function Badge({ className = "", variant = "default", children, style, ...props }: BadgeProps) {
  const getStyles = () => {
    switch (variant) {
      case "secondary":
        return { background: "rgba(0, 0, 0, 0.08)", color: "var(--ink)" };
      case "outline":
        return { background: "transparent", border: "1px solid rgba(0, 0, 0, 0.15)", color: "var(--ink)" };
      case "success":
        return { background: "rgba(0, 161, 155, 0.15)", color: "var(--mint, #00A19B)" };
      case "warning":
        return { background: "rgba(217, 119, 6, 0.15)", color: "#b45309" };
      default:
        return { background: "rgba(0, 161, 155, 0.12)", color: "var(--mint, #00A19B)" };
    }
  };

  return (
    <span
      className={`badge ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        ...getStyles(),
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
