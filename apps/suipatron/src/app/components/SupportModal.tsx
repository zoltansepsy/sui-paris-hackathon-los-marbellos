"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { useAccessPasses } from "../lib/access-pass";
import { useSponsorTransaction } from "../lib/use-sponsor-transaction";
import { isEnokiConfigured } from "../lib/enoki-provider";
import { buildPurchaseAccessTx } from "../lib/ptb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import type { Creator } from "../lib/mock-data";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const SUI_TO_MIST = BigInt(1000000000);

interface SupportModalProps {
  creator: Creator;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function SupportModalWithSponsor(props: SupportModalProps) {
  const { creator, open, onOpenChange, onSuccess } = props;
  const { user } = useAuth();
  const { addAccessPass } = useAccessPasses(user?.id);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const sponsorTx = useSponsorTransaction();

  const handleSupport = async () => {
    if (!user) {
      toast.error("Please sign in to support creators");
      router.push("/?signin=true");
      return;
    }

    setIsProcessing(true);
    try {
      const priceMist = BigInt(Math.round(creator.price * Number(SUI_TO_MIST)));
      await sponsorTx.execute({
        buildTx: () => buildPurchaseAccessTx(creator.id, priceMist),
        getSender: async () => user.id,
      });
      addAccessPass(creator.id);
      onOpenChange(false);
      toast.success("Access granted! You can now view all content.");
      onSuccess?.();
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Transaction failed. Please try again.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Support Creator</DialogTitle>
          <DialogDescription>
            One-time payment for permanent access to all content
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-4 py-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={creator.avatar} alt={creator.name} />
            <AvatarFallback>
              {creator.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold">{creator.name}</h3>
            {creator.suinsName && (
              <Badge variant="secondary" className="text-xs">
                {creator.suinsName}
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-4 py-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Payment amount
            </span>
            <span className="font-semibold text-lg">{creator.price} SUI</span>
          </div>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Content unlocked</span>
              <span className="font-medium">{creator.contentCount} posts</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Access type</span>
              <span className="font-medium">Permanent</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform fee</span>
              <span className="font-medium text-green-600">0%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            You&apos;ll need SUI in your account to complete this. No additional
            gas fees required.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button onClick={handleSupport} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Support for ${creator.price} SUI`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SupportModalMock(props: SupportModalProps) {
  const { creator, open, onOpenChange, onSuccess } = props;
  const { user } = useAuth();
  const { addAccessPass } = useAccessPasses(user?.id);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSupport = async () => {
    if (!user) {
      toast.error("Please sign in to support creators");
      router.push("/?signin=true");
      return;
    }
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    addAccessPass(creator.id);
    setIsProcessing(false);
    onOpenChange(false);
    toast.success("Access granted! You can now view all content.");
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Support Creator</DialogTitle>
          <DialogDescription>
            One-time payment for permanent access to all content
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-4 py-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={creator.avatar} alt={creator.name} />
            <AvatarFallback>
              {creator.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold">{creator.name}</h3>
            {creator.suinsName && (
              <Badge variant="secondary" className="text-xs">
                {creator.suinsName}
              </Badge>
            )}
          </div>
        </div>
        <div className="space-y-4 py-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Payment amount
            </span>
            <span className="font-semibold text-lg">{creator.price} SUI</span>
          </div>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Content unlocked</span>
              <span className="font-medium">{creator.contentCount} posts</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Access type</span>
              <span className="font-medium">Permanent</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform fee</span>
              <span className="font-medium text-green-600">0%</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            You&apos;ll need SUI in your account to complete this. No additional
            gas fees required.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button onClick={handleSupport} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Support for ${creator.price} SUI`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SupportModal(props: SupportModalProps) {
  return isEnokiConfigured ? (
    <SupportModalWithSponsor {...props} />
  ) : (
    <SupportModalMock {...props} />
  );
}
