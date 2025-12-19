"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from "next/navigation";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { LandingPage } from "@/components/LandingPage";
import { NameInputScreen } from "@/components/NameInputScreen";
import { HomeScreen } from "@/components/HomeScreen";
import { PrayerIntentScreen } from "@/components/PrayerIntentScreen";
import { PrayerPlayerScreen } from "@/components/PrayerPlayerScreen";
import { PaywallModal } from "@/components/PaywallModal";
import { ConfettiPop } from "@/components/ConfettiPop";
import { BottomTabNavigation, type TabType } from "@/components/BottomTabNavigation";
import { HomeHeader } from "@/components/HomeHeader";
import { SongModeScreen } from "@/components/SongModeScreen";
import { FeedHistoryScreen } from "@/components/FeedHistoryScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FaSpinner, FaHeart, FaHistory } from "react-icons/fa";

export default function AppPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [currentTab, setCurrentTab] = useState<TabType>("home");
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState<string>("");
  const [appFlow, setAppFlow] = useState<"landing" | "name" | "app">("landing");
  const [showPrayerIntent, setShowPrayerIntent] = useState(false);
  const [currentPrayer, setCurrentPrayer] = useState<{text: string; audioUrl?: string; intent?: string} | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [localUserName, setLocalUserName] = useState<string>("");
  // Initialize app flow based on whether user has name
  // First-time users (no name) should go: landing -> name -> app
  // Returning users (has name) should go: app directly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('selah_user_name');
      if (storedName) {
        setLocalUserName(storedName);
        // If user has a name, skip onboarding and go straight to app
        if (appFlow === "landing") {
          setAppFlow("app");
        }
      } else {
        // First-time user: start with landing screen
        if (appFlow === "app") {
          setAppFlow("landing");
        }
      }
    }
  }, []);

  useEffect(() => {
    // Allow ?tab=history or ?tab=daily to pre-select the tab when linking
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search || '');
        const tabParam = params.get('tab');
        if (tabParam === 'history' || tabParam === 'feed') {
          setCurrentTab(tabParam as TabType);
        }
      } catch (e) {
        // ignore
      }
    }

    let mounted = true;
    let authSubscription: any = null;

    const initUser = async (sessionUser: any) => {
      if (!mounted) return;
      setUser(sessionUser);
      
      // Check if user has completed onboarding (has display name)
      const displayName = sessionUser.user_metadata?.name || sessionUser.user_metadata?.displayName || sessionUser.email?.split('@')[0] || "";
      setUserDisplayName(displayName);
      
      // Check premium status
      try {
        const res = await fetch(`/api/user/subscription-status?userId=${sessionUser.id}`);
        if (res.ok) {
          const { isPro } = await res.json();
          setIsPremium(isPro);
        }
      } catch (error) {
        console.error('Failed to fetch premium status:', error);
      }
      
      setIsLoading(false);
    };

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error?.message?.includes('parse') || error?.message?.includes('JSON')) {
          await supabase.auth.signOut();
          router.push("/auth");
          return;
        }

        if (session?.user) {
          await initUser(session.user);
        } else {
          router.push("/auth");
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;
            
            if (event === 'SIGNED_IN' && session?.user) {
              await initUser(session.user);
            } else if (event === 'SIGNED_OUT') {
              router.push("/auth");
            }
          }
        );

        authSubscription = subscription;

      } catch (err) {
        console.error('[app/page] Auth error:', err);
        if (mounted) router.push('/auth');
      }
    };

    checkUser();

    return () => { 
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading && user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A1628] to-[#1a2942] flex items-center justify-center">
        <FaSpinner className="animate-spin text-[#D4A574] text-6xl" />
      </div>
    );
  }

  // Note: We allow app to work without authentication (delayed auth)
  // Only redirect if user tries to access premium features without auth
  // For now, we skip the auth check to allow free usage
      if (appFlow === "landing") {
        return (
          <div className="min-h-screen">
            <LandingPage onContinue={() => setAppFlow("name")} />
          </div>
        );
      }

      if (appFlow === "name") {
        return (
          <div className="min-h-screen">
            <NameInputScreen 
              onContinue={(name) => {
                setLocalUserName(name);
                setAppFlow("app");
              }}
            />
          </div>
        );
      }

  // Note: Onboarding is handled via NameInputScreen in the landing/name flow
  // No separate onboarding needed since we use delayed auth - name is collected before app entry

  // Show prayer intent screen (when user wants to pray for something specific)
  if (showPrayerIntent && appFlow === "app") {
        return (
          <div className="min-h-screen bg-gradient-to-b from-[#0A1628] to-[#1a2942] relative pb-20">
            <AnimatedBackground />
            <ScreenHeader 
              title="Pray for Something Specific"
              onBack={() => setShowPrayerIntent(false)}
            />
            <div className="pt-20 pb-24">
              <PrayerIntentScreen
                onGenerate={async (intent, customMessage) => {
                  const effectiveName = localUserName || userDisplayName || user?.email?.split('@')[0] || "Friend";
                  try {
                    const res = await fetch('/api/prayer/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: user?.id || 'anonymous',
                        need: intent,
                        message: customMessage,
                        userName: effectiveName,
                      }),
                    });

                    if (res.status === 402) {
                      setShowPaywall(true);
                      return;
                    }

                    if (!res.ok) {
                      const errorData = await res.json().catch(() => ({}));
                      throw new Error(errorData.error || `Failed to generate prayer (${res.status})`);
                    }

                    const data = await res.json();
                    
                    if (!data.prayerText) {
                      throw new Error('No prayer text returned from server');
                    }

                    setCurrentPrayer({
                      text: data.prayerText,
                      audioUrl: data.audioUrl,
                      intent: intent,
                    });
                    setShowPrayerIntent(false);
                  } catch (err) {
                    console.error('Error generating prayer:', err);
                    const errorMessage = err instanceof Error ? err.message : 'Failed to generate prayer. Please try again.';
                    alert(errorMessage);
                  }
                }}
                isGenerating={false}
              />
            </div>
            <BottomTabNavigation currentTab={currentTab} onTabChange={setCurrentTab} isPremium={isPremium} />
          </div>
        );
      }

  // Show prayer player screen (when prayer is generated)
  if (currentPrayer && appFlow === "app") {
        return (
          <div className="min-h-screen bg-gradient-to-b from-[#0A1628] to-[#1a2942] relative pb-20">
            <AnimatedBackground />
            <ScreenHeader 
              title="Your Prayer"
              onBack={() => setCurrentPrayer(null)}
            />
            <div className="pt-20 pb-24">
              <PrayerPlayerScreen
                prayerText={currentPrayer.text}
                audioUrl={currentPrayer.audioUrl}
                prayerIntent={currentPrayer.intent}
                userName={localUserName || userDisplayName || user?.email?.split('@')[0] || "Friend"}
                isPremium={isPremium}
                onNewPrayer={() => setShowPrayerIntent(true)}
                onShare={async () => {
                  if (navigator.share) {
                    await navigator.share({
                      title: 'My Personalized Prayer',
                      text: currentPrayer.text,
                    });
                  } else {
                    await navigator.clipboard.writeText(currentPrayer.text);
                    alert('Prayer copied to clipboard!');
                  }
                }}
                onCreateWorshipSong={() => {
                  if (!isPremium) {
                    setShowPaywall(true);
                  } else {
                    setCurrentTab("song-mode");
                  }
                }}
              />
            </div>
            <BottomTabNavigation currentTab={currentTab} onTabChange={setCurrentTab} isPremium={isPremium} />
          </div>
        );
      }

  return (
    <div className="min-h-screen relative pb-20 md:pb-0 animate-gradient">
      <AnimatedBackground />
      
      {/* Conditional Headers - ONE header per tab */}
      {currentTab === "home" && (
        <HomeHeader 
          userName={localUserName || userDisplayName || user?.email?.split('@')[0] || "Friend"}
          onNotificationsClick={() => {
            // Navigate to profile/settings where notifications toggle is
            setCurrentTab("profile");
          }}
          onSignOut={handleLogout}
        />
      )}
      {currentTab === "song-mode" && (
        <ScreenHeader 
          title="Worship" 
          showBack={false}
        />
      )}
      {currentTab === "feed" && (
        <ScreenHeader 
          title="History" 
          showBack={false}
        />
      )}
      {currentTab === "profile" && (
        <ScreenHeader 
          title="Profile & Settings" 
          showBack={false}
        />
      )}

      {/* Main Content Area - Simple structure */}
      <main className="pt-16 relative z-10">
        <AnimatePresence mode="wait">
          {currentTab === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <HomeScreen
                userName={localUserName || userDisplayName || user?.email?.split('@')[0] || "Friend"}
                todaysPrayer={currentPrayer ? {
                  text: currentPrayer.text,
                  audioUrl: currentPrayer.audioUrl,
                } : undefined}
                onPrayForSomething={() => setShowPrayerIntent(true)}
                onCreateWorshipSong={() => {
                  if (!isPremium) {
                    setShowPaywall(true);
                  } else {
                    setCurrentTab("song-mode");
                  }
                }}
                isPremium={isPremium}
              />
            </motion.div>
          )}
          {currentTab === "song-mode" && (
            <SongModeScreen 
              userId={user?.id || 'anonymous'}
              userName={localUserName || userDisplayName || user?.email?.split('@')[0] || "Friend"}
              isPremium={isPremium}
              onUpgrade={() => {
                if (!user) {
                  setShowPaywall(true);
                } else {
                  router.push('/pricing');
                }
              }}
            />
          )}
          {currentTab === "feed" && (
            <FeedHistoryScreen 
              userId={user?.id || 'anonymous'}
            />
          )}
          {currentTab === "profile" && (
            <ProfileScreen
              userId={user?.id || 'anonymous'}
              userName={localUserName || userDisplayName || user?.email?.split('@')[0]}
              userEmail={user?.email}
              isPremium={isPremium}
              onNameUpdate={(newName) => {
                setLocalUserName(newName);
              }}
              onSignOut={handleLogout}
              onManageSubscription={() => {
                if (!user) {
                  setShowPaywall(true);
                } else {
                  router.push('/pricing');
                }
              }}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomTabNavigation currentTab={currentTab} onTabChange={setCurrentTab} isPremium={isPremium} />

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSignInApple={async () => {
          // TODO: Implement Apple Sign-In
          setShowPaywall(false);
          // Redirect to payment flow
        }}
        onSignInGoogle={async () => {
          // TODO: Implement Google Sign-In
          setShowPaywall(false);
          // Redirect to payment flow
        }}
      />

      {showConfetti && <ConfettiPop show={showConfetti} onComplete={() => setShowConfetti(false)} />}
    </div>
  );
}