import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  BadgeCheck,
  Users,
  FileText,
  Calendar,
  Lock,
  Unlock,
  ArrowRight,
  Shield,
  Check,
  Loader2,
  Image as ImageIcon,
  FileType,
  Zap,
} from "lucide-react";
import { Button, Card, Avatar, Badge } from "../components/ui/Shared";
import { Modal } from "../components/ui/Modal";
import {
  MOCK_CREATORS,
  MOCK_CONTENT,
  MOCK_USER,
  Creator,
  Content,
} from "../data/mockData";
import { AuthContext } from "../components/layout/Layout";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";

export const CreatorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, login } = React.useContext(AuthContext);

  // State
  const [isPurchaseOpen, setIsPurchaseOpen] = React.useState(false);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<Content | null>(
    null,
  );

  // Data resolution
  const creator = MOCK_CREATORS.find((c) => c.id === id);
  const content = MOCK_CONTENT.filter((c) => c.creatorId === id);

  // Check access (mock logic)
  // In a real app, check if user.ownedPasses includes creator.id
  const hasAccess = React.useMemo(() => {
    if (!isAuthenticated || !user) return false;
    return user.ownedPasses.includes(id || "");
  }, [user, isAuthenticated, id]);

  if (!creator) {
    return <div className="p-12 text-center">Creator not found</div>;
  }

  const handleContentClick = (item: Content) => {
    if (hasAccess) {
      setSelectedContent(item);
      setIsViewerOpen(true);
    } else {
      setIsPurchaseOpen(true);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. Header Section */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-start mb-12">
        <Avatar src={creator.avatar} fallback={creator.name} size="xl" />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              {creator.name}
            </h1>
            <BadgeCheck className="h-5 w-5 text-[var(--brand-primary)]" />
          </div>
          <p className="text-[var(--brand-primary)] text-sm mb-4">
            {creator.suins}
          </p>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed mb-6">
            {creator.bio}
          </p>

          <div className="flex flex-wrap gap-4">
            <Stat
              icon={Users}
              label="Supporters"
              value={creator.supporterCount}
            />
            <Stat icon={FileText} label="Posts" value={creator.postCount} />
            <Stat icon={Calendar} label="Joined" value={creator.joinedDate} />
          </div>
        </div>

        {/* Support CTA Panel (Desktop: Right side, Mobile: Stacked) */}
        <Card
          className={cn(
            "w-full lg:w-[360px] p-6 shrink-0 transition-all",
            hasAccess
              ? "bg-[var(--success-subtle)] border-[var(--success)]/30"
              : "bg-[var(--bg-raised)]",
          )}
        >
          {hasAccess ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[var(--success)] font-semibold text-lg">
                <Check className="h-6 w-6" />
                Access Granted
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                You unlocked this creator's content.
                <br />
                Proof of support NFT is in your wallet.
              </p>
              <Button
                variant="outline"
                className="w-full text-[var(--brand-primary)] border-[var(--brand-primary)]/20 hover:bg-[var(--brand-primary-subtle)]"
              >
                View AccessPass on Explorer{" "}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Support this creator
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                One-time payment • Permanent access
              </p>

              <Button
                size="lg"
                className="w-full text-lg shadow-[var(--shadow-glow)]"
                onClick={() =>
                  isAuthenticated ? setIsPurchaseOpen(true) : login()
                }
              >
                Support for {creator.price} SUI
              </Button>

              <div className="space-y-2 pt-2">
                <Benefit text="Unlock all current & future content" />
                <Benefit text="On-chain proof of support (NFT)" />
                <Benefit text="100% goes to the creator" />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 2. Content Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Content ({content.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <ContentCard
              key={item.id}
              content={item}
              isLocked={!hasAccess}
              onClick={() => handleContentClick(item)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <PurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        creator={creator}
      />

      {selectedContent && (
        <ContentViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          content={selectedContent}
        />
      )}
    </div>
  );
};

// --- Sub-components ---

const Stat = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)]">
    <Icon className="h-4 w-4 text-[var(--text-tertiary)]" />
    <span className="text-sm font-medium text-[var(--text-primary)]">
      {value}
    </span>
    <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide">
      {label}
    </span>
  </div>
);

const Benefit = ({ text }: { text: string }) => (
  <div className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
    <Check className="h-4 w-4 text-[var(--success)] shrink-0 mt-0.5" />
    <span>{text}</span>
  </div>
);

const ContentCard = ({
  content,
  isLocked,
  onClick,
}: {
  content: Content;
  isLocked: boolean;
  onClick: () => void;
}) => {
  const TypeIcon =
    content.type === "IMG"
      ? ImageIcon
      : content.type === "PDF"
        ? FileType
        : FileText;
  const badgeVariant =
    content.type === "IMG" ? "image" : content.type === "PDF" ? "pdf" : "text";

  return (
    <Card
      className="overflow-hidden cursor-pointer group hover:border-[var(--brand-primary)]/50 transition-all hover:shadow-[var(--shadow-md)]"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-[var(--bg-elevated)] overflow-hidden">
        {/* Thumbnail Layer */}
        {content.thumbnail ? (
          <img
            src={content.thumbnail}
            alt={content.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              isLocked
                ? "blur-xl scale-110 opacity-50"
                : "group-hover:scale-105",
            )}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className="h-12 w-12 text-[var(--text-tertiary)] opacity-20" />
          </div>
        )}

        {/* Lock Overlay */}
        <div className="absolute top-3 left-3">
          {isLocked ? (
            <div className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-[var(--text-tertiary)]">
              <Lock className="h-4 w-4" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-[var(--success)] flex items-center justify-center text-white shadow-lg">
              <Unlock className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Type Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={badgeVariant}>{content.type}</Badge>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1 mb-1 group-hover:text-[var(--brand-primary)] transition-colors">
          {content.title}
        </h3>
        <p className="text-sm text-[var(--text-tertiary)]">
          {content.createdAt}
        </p>
      </div>
    </Card>
  );
};

// --- Purchase Modal ---
const PurchaseModal = ({
  isOpen,
  onClose,
  creator,
}: {
  isOpen: boolean;
  onClose: () => void;
  creator: Creator;
}) => {
  const { user } = React.useContext(AuthContext);
  const [status, setStatus] = React.useState<"idle" | "processing" | "success">(
    "idle",
  );

  const handlePay = async () => {
    setStatus("processing");
    // Simulate transaction
    await new Promise((r) => setTimeout(r, 2000));

    // In real app, we'd update context/state here
    if (user) {
      user.ownedPasses.push(creator.id);
    }
    setStatus("success");
  };

  const handleClose = () => {
    onClose();
    // Reset after closing animation
    setTimeout(() => setStatus("idle"), 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Confirm Support">
      {status === "success" ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="h-20 w-20 rounded-full bg-[var(--success-subtle)] flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-[var(--success)]" />
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            Access Granted!
          </h3>
          <p className="text-[var(--text-secondary)] mb-8">
            You now have permanent access to {creator.name}'s content.
          </p>
          <Button size="lg" className="w-full" onClick={handleClose}>
            View Content
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)]">
            <Avatar src={creator.avatar} fallback="C" />
            <div>
              <p className="font-semibold text-[var(--text-primary)]">
                {creator.name}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {creator.suins}
              </p>
            </div>
          </div>

          <div className="space-y-3 py-4 border-y border-[var(--border-default)]">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Access Price</span>
              <span className="font-mono text-[var(--text-primary)]">
                {creator.price.toFixed(3)} SUI
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Gas Fees</span>
              <span className="text-[var(--success)] flex items-center gap-1">
                <Zap className="h-3 w-3" /> Sponsored
              </span>
            </div>
            <div className="pt-2 flex justify-between text-lg font-bold text-[var(--text-primary)]">
              <span>Total</span>
              <span>{creator.price.toFixed(3)} SUI</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--brand-primary-muted)] border border-[var(--brand-primary)]/20">
            <Shield className="h-5 w-5 text-[var(--brand-primary)] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--brand-primary)]">
              You'll receive an AccessPass NFT. This is on-chain proof of your
              support.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={onClose}
              disabled={status === "processing"}
            >
              Cancel
            </Button>
            <Button
              className="flex-[2]"
              onClick={handlePay}
              loading={status === "processing"}
            >
              {status === "processing"
                ? "Processing..."
                : `Confirm & Pay ${creator.price} SUI`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

// --- Content Viewer Modal ---
const ContentViewer = ({
  isOpen,
  onClose,
  content,
}: {
  isOpen: boolean;
  onClose: () => void;
  content: Content;
}) => {
  const [decryptionStatus, setStatus] = React.useState<"decrypting" | "ready">(
    "decrypting",
  );

  // Simulate decryption delay
  React.useEffect(() => {
    if (isOpen) {
      setStatus("decrypting");
      const timer = setTimeout(() => setStatus("ready"), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[800px]">
      {decryptionStatus === "decrypting" ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="relative mb-6">
            <Shield className="h-16 w-16 text-[var(--brand-primary)] animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Decrypting Content...
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Unlocking via SEAL network
          </p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Content Display Area */}
          <div className="bg-black/20 rounded-[var(--radius-lg)] overflow-hidden min-h-[300px] flex items-center justify-center border border-[var(--border-default)]">
            {content.type === "IMG" && content.thumbnail && (
              <img
                src={content.thumbnail}
                alt={content.title}
                className="max-h-[60vh] w-auto object-contain"
              />
            )}
            {content.type === "TXT" && (
              <div className="p-8 text-left max-w-prose">
                <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
                  [Decrypted Article Content Placeholder] Lorem ipsum dolor sit
                  amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                  veniam, quis nostrud exercitation ullamco laboris nisi ut
                  aliquip ex ea commodo consequat.
                </p>
              </div>
            )}
            {content.type === "PDF" && (
              <div className="text-center p-12">
                <FileType className="h-16 w-16 text-[var(--text-secondary)] mx-auto mb-4" />
                <p className="text-[var(--text-primary)]">
                  PDF Viewer Placeholder
                </p>
                <Button variant="outline" className="mt-4">
                  Download PDF
                </Button>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {content.title}
            </h2>
            <p className="text-[var(--text-secondary)]">
              {content.description}
            </p>
            <div className="mt-4 flex gap-2">
              <Badge
                variant={
                  content.type === "IMG"
                    ? "image"
                    : content.type === "PDF"
                      ? "pdf"
                      : "text"
                }
              >
                {content.type}
              </Badge>
              <span className="text-xs text-[var(--text-tertiary)] self-center">
                Published {content.createdAt}
              </span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
