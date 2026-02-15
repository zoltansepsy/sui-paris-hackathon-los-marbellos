"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { ImageIcon, Sparkles, Upload, Save } from "lucide-react";
import toast from "react-hot-toast";

interface NFTConfig {
  name: string;
  description: string;
  imagePreview: string | null;
}

export function NFTLabCard() {
  const [nftConfig, setNftConfig] = useState<NFTConfig>({
    name: "",
    description: "",
    imagePreview: null,
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("suipatron-nft-config");
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setNftConfig(config);
      } catch (e) {
        console.error("Failed to load NFT config:", e);
      }
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB for demo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNftConfig((prev) => ({
        ...prev,
        imagePreview: reader.result as string,
      }));
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!nftConfig.name.trim()) {
      toast.error("Please enter an NFT name");
      return;
    }
    if (!nftConfig.imagePreview) {
      toast.error("Please upload an NFT image");
      return;
    }

    // Save to localStorage
    localStorage.setItem("suipatron-nft-config", JSON.stringify(nftConfig));
    setHasChanges(false);
    toast.success("NFT design saved! (Demo mode)");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <CardTitle>NFT Lab</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Demo
            </Badge>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            size="sm"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Design
          </Button>
        </div>
        <CardDescription>
          Design the NFT your supporters receive when they subscribe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demo Info Banner */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
          <div className="flex items-start space-x-2">
            <svg className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-amber-900 dark:text-amber-100">
              <p className="font-semibold mb-1">Demo Mode</p>
              <p>This is a demonstration UI. In production, NFT metadata would be stored on-chain and minted via smart contract when supporters subscribe.</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Configuration Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nft-name">NFT Name</Label>
              <Input
                id="nft-name"
                placeholder="e.g., Alice's Supporter Pass"
                value={nftConfig.name}
                onChange={(e) => {
                  setNftConfig((prev) => ({ ...prev, name: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nft-description">Description</Label>
              <Textarea
                id="nft-description"
                placeholder="Describe the benefits of this NFT..."
                rows={4}
                value={nftConfig.description}
                onChange={(e) => {
                  setNftConfig((prev) => ({ ...prev, description: e.target.value }));
                  setHasChanges(true);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nft-image">NFT Image</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                <input
                  id="nft-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <label htmlFor="nft-image" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* Right: NFT Preview */}
          <div className="space-y-2">
            <Label>NFT Preview</Label>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-square bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  {nftConfig.imagePreview ? (
                    <img
                      src={nftConfig.imagePreview}
                      alt="NFT Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-white/80">
                      <ImageIcon className="h-16 w-16 mx-auto mb-2" />
                      <p className="text-sm">Upload an image to preview</p>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2 bg-card">
                  <h3 className="font-semibold text-sm">
                    {nftConfig.name || "NFT Name"}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {nftConfig.description || "NFT description will appear here"}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant="outline" className="text-xs">
                      Supporter Pass
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      #0001
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Integration Note */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
          <div className="text-xs text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">Smart Contract Integration (Planned)</p>
            <p>When a supporter purchases access, the smart contract would:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 ml-2">
              <li>Mint a new NFT with this design</li>
              <li>Store image on Walrus and metadata on-chain</li>
              <li>Transfer the NFT to the supporter&apos;s wallet</li>
              <li>Grant content access via AccessPass logic</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
