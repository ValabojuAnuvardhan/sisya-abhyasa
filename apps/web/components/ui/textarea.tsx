import * as React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className = "", style, ...props }: TextareaProps) {
  return (
    <textarea
      className={`textarea ${className}`}
      style={{
        width: "100%",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid rgba(0, 0, 0, 0.16)",
        background: "#f7f2eb",
        color: "var(--ink)",
        fontSize: "14px",
        fontFamily: "inherit",
        outline: "none",
        resize: "vertical",
        minHeight: "80px",
        ...style,
      }}
      {...props}
    />
  );
}
