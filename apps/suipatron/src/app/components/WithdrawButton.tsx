"use client";

import { useAuth } from "../lib/auth-context";
import { useSponsorTransaction } from "../lib/use-sponsor-transaction";
import { buildWithdrawEarningsTx } from "../lib/ptb";
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
  const { user, updateUser } = useAuth();
  const sponsorTx = useSponsorTransaction();

  const profileId = user?.creatorProfile?.profileId;
  const creatorCapId = user?.creatorProfile?.creatorCapId;

  const handleWithdraw = async () => {
    if (!user || !profileId || !creatorCapId) {
      toast.error("Profile or cap not found. Refreshing may help.");
      return;
    }

    try {
      await sponsorTx.execute({
        buildTx: () => buildWithdrawEarningsTx(profileId, creatorCapId),
        getSender: async () => user.id,
      });
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
      disabled={sponsorTx.isLoading}
    >
      {sponsorTx.isLoading ? (
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
