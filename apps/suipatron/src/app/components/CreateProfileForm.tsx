"use client";

import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { useSponsorTransaction } from "../lib/use-sponsor-transaction";
import { buildCreateProfileTx } from "../lib/ptb";
import { getCreatedProfileFromTx } from "../lib/get-created-objects";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const SUI_TO_MIST = BigInt(1000000000);

export function CreateProfileForm({ onSuccess }: { onSuccess: () => void }) {
  const { user, updateUser } = useAuth();
  const sponsorTx = useSponsorTransaction();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [price, setPrice] = useState("5");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const priceMist = BigInt(
        Math.round(parseFloat(price || "0") * Number(SUI_TO_MIST)),
      );
      const { digest } = await sponsorTx.execute({
        buildTx: () => buildCreateProfileTx(name, bio, priceMist),
        getSender: async () => user.id,
      });

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
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={sponsorTx.isLoading}
      >
        {sponsorTx.isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Creator Profile"
        )}
      </Button>
    </form>
  );
}
