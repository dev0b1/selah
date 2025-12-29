"use client";

import { useRouter } from "next/navigation";
import { LandingPage } from "@/components/LandingPage";

export default function HomePage() {
  const router = useRouter();

  const handleContinue = () => {
    // Set a session flag to indicate user is coming from landing page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selah_from_landing', 'true');
    }
    // Navigate to /app without query parameters
    router.push("/app");
  };

  return <LandingPage onContinue={handleContinue} />;
}
