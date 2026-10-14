"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
export interface GoogleSignInButtonProps {
  callbackUrl?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  onError?: (error: unknown) => void;
}
/** Ready-to-use Auth.js Google sign-in button. */
export function GoogleSignInButton({ callbackUrl = "/", label = "Continue with Google", className, disabled = false, onError }: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try { await signIn("google", { callbackUrl }); }
    catch (error) { onError?.(error); }
    finally { setLoading(false); }
  };
  return <button type="button" onClick={handleClick} disabled={disabled || loading} className={className}>{loading ? "Connecting…" : label}</button>;
}
