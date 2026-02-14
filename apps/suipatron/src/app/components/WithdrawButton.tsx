"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useAuth } from "../lib/auth-context";
import { useSuiPatronTransactions } from "../hooks/useTransactions";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface WithdrawButtonProps {
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function WithdrawButton({
  variant = "outline",
  size = "sm",
  className,
}: WithdrawButtonProps) {
  const account = useCurrentAccount();
  const { user, walletAddress, updateUser } = useAuth();
  const sender = account?.address ?? walletAddress ?? null;
  const { withdrawEarnings, isPending } = useSuiPatronTransactions();

  const profileId = user?.creatorProfile?.profileId;
  const creatorCapId = user?.creatorProfile?.creatorCapId;

  const handleWithdraw = async () => {
    if (!user || !profileId || !creatorCapId) {
      toast.error("Profile or cap not found. Refreshing may help.");
      return;
    }

    try {
      await withdrawEarnings(profileId, creatorCapId);
      updateUser({
        creatorProfile: {
          ...user.creatorProfile,
          balance: 0,
        },
      });
      toast.success("Withdrawal successful!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Withdrawal failed");
    }
  };

  if (!profileId || !creatorCapId) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        Withdraw
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleWithdraw}
      disabled={!sender || isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Withdrawing...
        </>
      ) : (
        "Withdraw"
      )}
    </Button>
  );
}
