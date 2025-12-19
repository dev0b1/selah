"use client";

import { useRouter } from "next/navigation";
import { LandingPage } from "@/components/LandingPage";

export default function HomePage() {
  const router = useRouter();

  const handleContinue = () => {
    // Navigate to /app which will show the name input screen
    router.push("/app");
  };

  return <LandingPage onContinue={handleContinue} />;
}
