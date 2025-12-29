"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaTimes } from "react-icons/fa";

interface SignupPromptProps {
  show: boolean;
  onClose: () => void;
  title: string;
  description: string;
  primaryAction: string;
  secondaryAction: string;
}

export function SignupPrompt({
  show,
  onClose,
  title,
  description,
  primaryAction,
  secondaryAction,
}: SignupPromptProps) {
  const router = useRouter();

  const handlePrimaryAction = () => {
    router.push("/auth?redirectTo=/app");
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-[#1a2942] to-[#0A1628] border-2 border-[#D4A574]/30 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[#8B9DC3] hover:text-white transition-colors"
                aria-label="Close"
              >
                <FaTimes className="text-xl" />
              </button>

              {/* Content */}
              <div className="text-center space-y-4 mt-2">
                <h3 className="text-2xl font-bold text-white">
                  {title}
                </h3>
                <p className="text-[#8B9DC3] text-base">
                  {description}
                </p>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={handlePrimaryAction}
                    className="btn-primary w-full py-3 text-base font-bold"
                  >
                    {primaryAction}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3 text-[#8B9DC3] hover:text-white transition-colors text-sm"
                  >
                    {secondaryAction}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
