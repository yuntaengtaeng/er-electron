import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Button({ children, onClick, disabled }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "0.5rem 1.25rem",
        borderRadius: "6px",
        border: "1px solid #ccc",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "14px",
      }}
    >
      {children}
    </button>
  );
}
