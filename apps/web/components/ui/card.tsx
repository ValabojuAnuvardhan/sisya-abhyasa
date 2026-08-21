import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`card ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.45)",
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`card-header ${className}`}
      style={{ marginBottom: "12px", ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }: CardProps) {
  return (
    <h3
      className={`card-title ${className}`}
      style={{
        fontFamily: "Georgia, serif",
        fontSize: "18px",
        fontWeight: "bold",
        margin: "0 0 4px 0",
        color: "var(--ink)",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className = "", children, ...props }: CardProps) {
  return (
    <p
      className={`card-description ${className}`}
      style={{
        fontSize: "13px",
        color: "var(--muted)",
        margin: 0,
        lineHeight: "1.5",
        ...props.style,
      }}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ className = "", children, ...props }: CardProps) {
  return (
    <div className={`card-content ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`card-footer ${className}`}
      style={{ marginTop: "16px", display: "flex", gap: "8px", alignItems: "center", ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
}
