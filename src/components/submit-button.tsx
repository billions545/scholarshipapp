"use client";

import { useFormStatus } from "react-dom";
import { ui } from "@/lib/ui";

const VARIANT_CLASS = {
  primary: ui.btnPrimary,
  secondary: ui.btnSecondary,
  danger: ui.btnDanger,
  ghost: ui.btnGhost,
  custom: "",
} as const;

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? "h-4 w-4"}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
  );
}

// Drop-in replacement for a plain <button type="submit">. Shows a spinner
// and disables itself while its enclosing <form>'s action is pending —
// useFormStatus only sees the nearest <form>, so this works unmodified
// inside forms bound to server actions via .bind(null, id).
export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  className,
  name,
  value,
  disabled,
  title,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: keyof typeof VARIANT_CLASS;
  className?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  title?: string;
}) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={isDisabled}
      title={title}
      className={`${VARIANT_CLASS[variant]} ${className ?? ""} ${isDisabled ? "cursor-not-allowed opacity-70" : ""}`}
    >
      {pending && <Spinner className="mr-2 h-4 w-4" />}
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
