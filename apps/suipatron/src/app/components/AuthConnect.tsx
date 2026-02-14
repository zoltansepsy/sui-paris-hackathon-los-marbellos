"use client";

import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { isEnokiConfigured } from "../lib/enoki-provider";
import { ConnectButton } from "@mysten/dapp-kit";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogIn } from "lucide-react";

export interface AuthConnectProps {
  /** Trigger label for the main sign-in dropdown when both options exist */
  connectText?: string;
  /** "Connect Wallet" button label */
  walletConnectText?: string;
  /** Trigger size */
  size?: "default" | "sm" | "lg";
  /** Trigger variant */
  variant?: "default" | "outline" | "secondary";
  /** Layout: "dropdown" = one trigger that opens menu (Google) + wallet button beside; "inline" = same but both always visible as a row */
  layout?: "dropdown" | "inline";
  /** Extra class for the wrapper (or single button when wallet-only) */
  className?: string;
}

/**
 * Single component for auth: Google sign-in and Connect Wallet.
 * When Enoki is configured: one trigger "Sign in" opens a dropdown with
 * "Sign in with Google", and a "Connect Wallet" button is shown next to it.
 * When Enoki is not configured, renders only ConnectButton.
 */
export function AuthConnect({
  connectText = "Sign in",
  walletConnectText = "Connect Wallet",
  size = "default",
  variant = "default",
  layout = "dropdown",
  className,
}: AuthConnectProps) {
  const { signIn } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isEnokiConfigured) {
    return (
      <ConnectButton connectText={walletConnectText} className={className} />
    );
  }

  const trigger = (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <LogIn className="mr-2 h-4 w-4" />
          {connectText}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onSelect={() => {
            setOpen(false);
            signIn();
          }}
          className="cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div
      className={
        layout === "inline"
          ? `flex items-center gap-2 ${className ?? ""}`
          : className
      }
    >
      {trigger}
      <ConnectButton connectText={walletConnectText} />
    </div>
  );
}
