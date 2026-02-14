"use client";

import { useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useAuth } from "../lib/auth-context";
import { useSuiPatronTransactions } from "../hooks/useTransactions";
import { getCreatedProfileFromTx } from "../lib/get-created-objects";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ConnectButton } from "@mysten/dapp-kit";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const SUI_TO_MIST = 1e9;

export function CreateProfileForm({ onSuccess }: { onSuccess: () => void }) {
  const account = useCurrentAccount();
  const { user, updateUser } = useAuth();
  const { createProfile, isPending } = useSuiPatronTransactions();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("5");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const priceMist = Math.round(parseFloat(price || "0") * SUI_TO_MIST);
      const result = await createProfile(name, bio, priceMist);
      const digest = result.digest;

      const created = await getCreatedProfileFromTx(digest);
      if (created) {
        updateUser({
          isCreator: true,
          name,
          creatorProfile: {
            profileId: created.profileId,
            creatorCapId: created.creatorCapId,
            bio,
            price: parseFloat(price) || 5,
            balance: 0,
            contentCount: 0,
            supporterCount: 0,
          },
        });
      } else {
        updateUser({
          isCreator: true,
          name,
          creatorProfile: {
            bio,
            price: parseFloat(price) || 5,
            balance: 0,
            contentCount: 0,
            supporterCount: 0,
          },
        });
      }

      toast.success("Creator profile created!");
      onSuccess();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="create-name">Display Name</Label>
        <Input
          id="create-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-bio">Bio</Label>
        <Textarea
          id="create-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Tell supporters about your work..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="create-price">Support Price (SUI)</Label>
        <Input
          id="create-price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0"
          step="0.1"
          required
        />
        <p className="text-xs text-muted-foreground">
          One-time payment for permanent access to all your content
        </p>
      </div>
      {!account ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Connect your wallet to create a creator profile.
          </p>
          <ConnectButton connectText="Connect Wallet" />
        </div>
      ) : (
        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Creator Profile"
          )}
        </Button>
      )}
    </form>
  );
}
