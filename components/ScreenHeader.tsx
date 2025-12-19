"use client";

import { FaArrowLeft, FaCrown } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({
  title,
  showBack = true,
  rightElement,
  onBack,
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A1628]/95 backdrop-blur-lg border-b border-[#8B9DC3]/20">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Back Button */}
        {showBack && (
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center text-[#8B9DC3] hover:text-[#F5F5F5] transition-colors touch-manipulation"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-xl" />
          </button>
        )}
        {!showBack && <div className="w-10" />}

        {/* Center: Title */}
        <h1 className="text-lg font-bold text-[#F5F5F5] flex-1 text-center">
          {title}
        </h1>

        {/* Right: Custom Element or Spacer */}
        <div className="w-10 flex items-center justify-end">
          {rightElement}
        </div>
      </div>
    </header>
  );
}

