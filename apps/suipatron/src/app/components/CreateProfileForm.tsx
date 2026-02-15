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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const SUI_TO_MIST = BigInt(1000000000);

export function CreateProfileForm({ onSuccess }: { onSuccess: () => void }) {
  const { user, updateUser } = useAuth();
  const sponsorTx = useSponsorTransaction();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [tierName, setTierName] = useState("Supporter");
  const [tierDescription, setTierDescription] = useState(
    "Access to all content",
  );
  const [tierPrice, setTierPrice] = useState("5");
  const [tierLevel, setTierLevel] = useState("1");
  const [duration, setDuration] = useState("permanent");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const priceMist = BigInt(
        Math.round(parseFloat(tierPrice || "0") * Number(SUI_TO_MIST)),
      );
      const level = parseInt(tierLevel) || 1;
      const durationMs =
        duration === "permanent" ? null : BigInt(parseInt(duration) * 86400000);
      const { digest } = await sponsorTx.execute({
        buildTx: () =>
          buildCreateProfileTx(
            name,
            bio,
            tierName,
            tierDescription,
            priceMist,
            level,
            durationMs,
          ),
        getSender: async () => user.id,
      });

      const created = await getCreatedProfileFromTx(digest);
      const tier = {
        name: tierName,
        description: tierDescription,
        price: parseFloat(tierPrice) || 5,
        tierLevel: level,
        durationMs:
          duration === "permanent" ? null : parseInt(duration) * 86400000,
      };
      if (created) {
        updateUser({
          isCreator: true,
          name,
          creatorProfile: {
            profileId: created.profileId,
            creatorCapId: created.creatorCapId,
            bio,
            tiers: [tier],
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
            tiers: [tier],
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

      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-sm">Initial Tier</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="create-tier-name">Tier Name</Label>
            <Input
              id="create-tier-name"
              value={tierName}
              onChange={(e) => setTierName(e.target.value)}
              required
              placeholder="e.g. Supporter"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="create-tier-price">Price (SUI)</Label>
            <Input
              id="create-tier-price"
              type="number"
              value={tierPrice}
              onChange={(e) => setTierPrice(e.target.value)}
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-tier-desc">Tier Description</Label>
          <Input
            id="create-tier-desc"
            value={tierDescription}
            onChange={(e) => setTierDescription(e.target.value)}
            placeholder="What supporters get at this tier"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="create-tier-duration">Access Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger id="create-tier-duration">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="permanent">Permanent (one-time)</SelectItem>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="365">365 days</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {duration === "permanent"
              ? "Supporters pay once for permanent access"
              : `Supporters pay every ${duration} days to maintain access`}
          </p>
        </div>
        <input type="hidden" value={tierLevel} />
        <p className="text-xs text-muted-foreground">
          You can add more tiers after creating your profile
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
