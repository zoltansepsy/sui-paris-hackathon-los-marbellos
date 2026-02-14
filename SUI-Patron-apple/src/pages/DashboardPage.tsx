import React from "react";
import {
  DollarSign,
  Users,
  FileText,
  CheckCircle,
  Upload,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Card, Button, Avatar, Badge } from "../components/ui/Shared";
import { Modal } from "../components/ui/Modal";
import { MOCK_USER, MOCK_CONTENT } from "../data/mockData";
import { cn } from "../lib/utils";

export const DashboardPage = () => {
  const [activeTab, setActiveTab] = React.useState<
    "earnings" | "content" | "supporters" | "profile"
  >("earnings");
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);

  // Mock Stats
  const stats = [
    { label: "Earnings", value: "125.5 SUI", icon: DollarSign },
    { label: "Supporters", value: "23", icon: Users },
    { label: "Content", value: "12", icon: FileText },
    { label: "Profile", value: "Complete", icon: CheckCircle, isBadge: true },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="p-6 flex items-start justify-between bg-[var(--bg-raised)]"
          >
            <div>
              <p className="text-sm text-[var(--text-tertiary)] mb-1">
                {stat.label}
              </p>
              {stat.isBadge ? (
                <Badge variant="success" className="text-sm">
                  Complete
                </Badge>
              ) : (
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {stat.value}
                </p>
              )}
            </div>
            <div className="p-3 rounded-lg bg-[var(--bg-elevated)]">
              <stat.icon className="h-5 w-5 text-[var(--brand-primary)]" />
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border-default)] mb-8 overflow-x-auto">
        <div className="flex space-x-8 min-w-max">
          {["earnings", "content", "supporters", "profile"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "pb-4 text-sm font-medium border-b-2 transition-colors capitalize",
                activeTab === tab
                  ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "earnings" && <EarningsTab />}
        {activeTab === "content" && (
          <ContentTab onUpload={() => setIsUploadOpen(true)} />
        )}
        {activeTab === "supporters" && <SupportersTab />}
        {activeTab === "profile" && <ProfileTab />}
      </div>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
};

// --- Tabs ---

const EarningsTab = () => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <Card className="p-8 bg-gradient-to-br from-[var(--bg-raised)] to-[var(--bg-elevated)] border-[var(--border-default)]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
            Available Balance
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] font-mono">
            125.500 SUI
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            ≈ $188.25 USD
          </p>
        </div>
        <Button size="lg" className="min-w-[160px]">
          Withdraw All
        </Button>
      </div>
    </Card>

    <div>
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Recent Transactions
      </h3>
      <div className="space-y-3">
        {[
          {
            type: "in",
            amount: "5 SUI",
            from: "0x1a...4d",
            time: "2 hours ago",
          },
          {
            type: "out",
            amount: "50 SUI",
            from: "0x3c...8b",
            time: "3 days ago",
          },
          {
            type: "in",
            amount: "10 SUI",
            from: "0x5e...9f",
            time: "1 week ago",
          },
        ].map((tx, i) => (
          <Card
            key={i}
            className="p-4 flex items-center justify-between hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  tx.type === "in"
                    ? "bg-[var(--success-subtle)] text-[var(--success)]"
                    : "bg-[var(--warning-subtle)] text-[var(--warning)]",
                )}
              >
                {tx.type === "in" ? (
                  <ArrowDownLeft className="h-5 w-5" />
                ) : (
                  <ArrowUpRight className="h-5 w-5" />
                )}
              </div>
              <div>
                <p
                  className={cn(
                    "font-bold",
                    tx.type === "in"
                      ? "text-[var(--success)]"
                      : "text-[var(--text-primary)]",
                  )}
                >
                  {tx.type === "in" ? "+" : "-"}
                  {tx.amount}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] font-mono">
                  {tx.from}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--text-secondary)]">{tx.time}</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[var(--brand-primary)]"
              >
                View
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const ContentTab = ({ onUpload }: { onUpload: () => void }) => {
  // Filter mock content to only simulate "my" content
  const myContent = MOCK_CONTENT.slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Your Content
        </h3>
        <Button onClick={onUpload}>+ Upload Content</Button>
      </div>

      <div className="space-y-4">
        {myContent.map((item) => (
          <Card
            key={item.id}
            className="p-4 flex gap-4 hover:bg-[var(--bg-elevated)] transition-colors group"
          >
            <div className="h-16 w-16 rounded-md bg-[var(--bg-base)] overflow-hidden shrink-0">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-[var(--text-tertiary)]">
                  <FileText className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-[var(--text-primary)] truncate">
                  {item.title}
                </h4>
                <Badge
                  variant={
                    item.type === "IMG"
                      ? "image"
                      : item.type === "PDF"
                        ? "pdf"
                        : "text"
                  }
                >
                  {item.type}
                </Badge>
              </div>
              <p className="text-sm text-[var(--text-secondary)] truncate">
                {item.description}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">
                {item.createdAt}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const SupportersTab = () => (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
      Your Supporters (23)
    </h3>
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i} className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar fallback={`S${i}`} size="sm" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              0x1a2b...3c4d
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">Dec 15, 2024</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--text-primary)]">5 SUI</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    ))}
  </div>
);

const ProfileTab = () => (
  <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
    <Card className="p-8 space-y-6">
      <div className="flex items-start gap-6">
        <div className="flex flex-col gap-2 items-center">
          <Avatar fallback="ME" size="2xl" />
          <Button variant="outline" size="sm">
            Change
          </Button>
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Creator Name
            </label>
            <input
              type="text"
              defaultValue={MOCK_USER.email.split("@")[0]}
              className="w-full h-10 rounded-md bg-[var(--bg-input)] border border-[var(--border-default)] px-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Bio
            </label>
            <textarea
              className="w-full h-24 rounded-md bg-[var(--bg-input)] border border-[var(--border-default)] p-3 text-sm resize-none"
              defaultValue="Digital artist creating..."
            />
            <p className="text-xs text-right text-[var(--text-tertiary)] mt-1">
              42/500
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[var(--border-default)]">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Access Price (SUI)
          </label>
          <input
            type="number"
            defaultValue="5.000"
            className="w-full h-10 rounded-md bg-[var(--bg-input)] border border-[var(--border-default)] px-3 text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            SuiNS Name
          </label>
          <div className="h-10 flex items-center px-3 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-default)] text-sm text-[var(--text-tertiary)] cursor-not-allowed">
            {MOCK_USER.suins}
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </Card>
  </div>
);

// --- Upload Modal ---
const UploadModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [step, setStep] = React.useState(0); // 0: input, 1: encrypt, 2: upload, 3: publish, 4: done

  const handleUpload = async () => {
    setStep(1);
    await new Promise((r) => setTimeout(r, 1500));
    setStep(2);
    await new Promise((r) => setTimeout(r, 1500));
    setStep(3);
    await new Promise((r) => setTimeout(r, 1500));
    setStep(4);
    setTimeout(() => {
      onClose();
      setStep(0);
    }, 1500);
  };

  const labels = [
    "Encrypt & Upload",
    "Encrypting with SEAL...",
    "Uploading to Walrus...",
    "Publishing on-chain...",
    "Content Published!",
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Content">
      <div className="space-y-6">
        {/* Dropzone */}
        <div className="border-2 border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)] h-40 flex flex-col items-center justify-center text-[var(--text-tertiary)] hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary-muted)] transition-colors cursor-pointer">
          <Upload className="h-8 w-8 mb-2" />
          <p className="text-sm">Drag & drop your file or click to browse</p>
          <p className="text-xs mt-1">PNG, JPG, PDF, TXT (Max 5MB)</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Title
            </label>
            <input
              type="text"
              className="w-full h-10 rounded-md bg-[var(--bg-input)] border border-[var(--border-default)] px-3 text-sm"
              placeholder="e.g. Exclusive 4K Wallpaper"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Description
            </label>
            <textarea
              className="w-full h-20 rounded-md bg-[var(--bg-input)] border border-[var(--border-default)] p-3 text-sm resize-none"
              placeholder="Describe what's inside..."
            />
          </div>
        </div>

        {step > 0 && (
          <div className="w-full bg-[var(--bg-elevated)] h-1 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--brand-primary)] transition-all duration-500 ease-out"
              style={{ width: `${step * 25}%` }}
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={step > 0}
          >
            Cancel
          </Button>
          <Button
            className="flex-[2]"
            onClick={handleUpload}
            disabled={step > 0 && step < 4}
            loading={step > 0 && step < 4}
          >
            {step === 4 ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Published!
              </span>
            ) : (
              labels[step]
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
