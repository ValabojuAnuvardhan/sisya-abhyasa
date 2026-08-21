import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", style, ...props }: InputProps) {
  return (
    <input
      className={`input ${className}`}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.16)",
        background: "#f7f2eb",
        color: "var(--ink)",
        fontSize: "14px",
        outline: "none",
        transition: "border-color 0.15s ease",
        ...style,
      }}
      {...props}
    />
  );
}
