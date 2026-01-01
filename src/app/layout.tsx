import type { Metadata } from "next";
import "./globals.css";
import { DodoLoader } from "@/components/DodoLoader";
import ScrollToTop from "@/components/ScrollToTop";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

export const metadata: Metadata = {
  title: "Selah - Pause. Breathe. Pray.",
  description: "Selah helps you pause and reconnect with God through a daily Bible verse, a personalized spoken prayer, and optional AI-generated worship songs that speak your name.",
  keywords: ["selah", "prayer app", "bible verse", "daily prayer", "worship songs", "christian app", "faith", "peace", "bible", "KJV"],
  openGraph: {
    title: "Selah - Pause. Breathe. Pray.",
    description: "Daily Bible verse, personalized prayers, and worship songs that speak your name.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Crimson+Pro:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-black min-h-screen font-sans">
        <ScrollToTop />
        <DodoLoader />
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
