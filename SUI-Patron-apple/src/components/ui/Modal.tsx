import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { Button } from "./Shared";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-[480px]",
}: ModalProps) => {
  // Close on Escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[4px]"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.25,
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className={cn(
              "relative w-full overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-raised)] shadow-[var(--shadow-lg)] border border-[var(--border-default)] flex flex-col max-h-[90vh]",
              maxWidth,
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0">
              {title && (
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  {title}
                </h2>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="ml-auto h-8 w-8 p-0 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Divider */}
            <div className="mx-6 mt-4 border-b border-[var(--border-default)]" />

            {/* Body */}
            <div className="p-6 overflow-y-auto">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="p-6 pt-0 flex justify-end gap-3">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
