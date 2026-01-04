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
import { UpgradeModal } from "@/components/UpgradeModal";
import { ConfettiPop } from "@/components/ConfettiPop";
import { BottomTabNavigation, type TabType } from "@/components/BottomTabNavigation";
import { HomeHeader } from "@/components/HomeHeader";
import { PrayersHistoryScreen } from "@/components/PrayersHistoryScreen";
import { FeedHistoryScreen } from "@/components/FeedHistoryScreen";
import { ProfileScreen } from "@/components/ProfileScreen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SignupPrompt } from "@/components/SignupPrompt";
import { StarField } from "@/components/StarField";
import { FaSpinner, FaHeart, FaHistory, FaBell, FaSignOutAlt } from "react-icons/fa";

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
  const [currentPrayer, setCurrentPrayer] = useState<{ text: string; audioUrl?: string; intent?: string; prayerId?: string } | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [localUserName, setLocalUserName] = useState<string>("");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupPromptType, setSignupPromptType] = useState<'first-prayer' | 'save-history' | 'share' | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isGeneratingPrayer, setIsGeneratingPrayer] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  // Keep per-tab scroll positions so each tab can restore its own scroll offset
  const scrollPositions = useRef<Record<TabType, number>>({ home: 0, prayers: 0, feed: 0, profile: 0 });

  // Centralized tab change handler: saves current scroll, toggles tab,
  // and restores the target tab's scroll position. If the user clicks the
  // already-active tab, scroll to top.
  const handleTabChange = (tab: TabType) => {
    try {
      const currentY = typeof window !== 'undefined' ? window.scrollY || window.pageYOffset : 0;
      // save current position for the outgoing tab
      scrollPositions.current[currentTab] = currentY as number;
    } catch (e) {
      // ignore
    }

    if (tab === currentTab) {
      // Reselecting the same tab should scroll to top
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
      // also reset stored position
      scrollPositions.current[tab] = 0;
      return;
    }

    // switch tab
    setCurrentTab(tab);
  };

  // Initialize app flow based on whether user has name
  // First-time users (no name) should go: landing -> name -> app
  // Returning users (has name) should go: app directly
  useEffect(() => {
    setIsMounted(true);

    if (typeof window !== 'undefined') {
      // Check if coming from landing page (onboarding flow)
      const fromLanding = sessionStorage.getItem('selah_from_landing');

      const storedName = localStorage.getItem('selah_user_name');
      if (storedName) {
        setLocalUserName(storedName);
        // If user has a name, skip onboarding and go straight to app
        if (appFlow === "landing") {
          setAppFlow("app");
        }
      } else if (fromLanding === 'true') {
        // Coming from landing page - go directly to name input
        setAppFlow("name");
        // Clear the flag after using it
        sessionStorage.removeItem('selah_from_landing');
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
          handleTabChange(tabParam as TabType);
        }
      } catch (e) {
        // ignore
      }
    }

    let mounted = true;
    let authSubscription: any = null;

    // Load history data once on app load
    const loadHistoryData = async (currentUser?: any) => {
      if (historyLoaded) return;
      
      try {
        const userId = currentUser?.id || user?.id || 'anonymous';
        if (userId && userId !== 'anonymous') {
          const res = await fetch(`/api/prayer/history?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.prayers && data.prayers.length > 0) {
              setHistoryData(data.prayers);
            }
          }
        }
        
        // Also load from localStorage
        if (typeof window !== 'undefined') {
          const stored = JSON.parse(localStorage.getItem('generatedPrayers') || '[]');
          if (stored.length > 0) {
            setHistoryData(prev => {
              // Merge and deduplicate
              const merged = [...prev, ...stored];
              const unique = merged.filter((p, i, self) => 
                i === self.findIndex((t) => (t.id && p.id && t.id === p.id) || (t.id === p.id))
              );
              return unique;
            });
          }
        }
        
        setHistoryLoaded(true);
      } catch (error) {
        console.error('Failed to load history:', error);
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          const stored = JSON.parse(localStorage.getItem('generatedPrayers') || '[]');
          setHistoryData(stored);
        }
        setHistoryLoaded(true);
      }
    };

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
      
      // Load history data after user is initialized
      loadHistoryData(sessionUser);
    };

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error?.message?.includes('parse') || error?.message?.includes('JSON')) {
          await supabase.auth.signOut();
          router.push("/auth");
          return;
        }

        // Allow app to work without authentication (delayed auth)
        // Only initialize user if they're logged in, but don't redirect if not
        if (session?.user) {
          await initUser(session.user);
        } else {
          // Load history even if not logged in
          loadHistoryData(null);
        }
        // No redirect - allow free usage without auth

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            if (event === 'SIGNED_IN' && session?.user) {
              await initUser(session.user);
            } else if (event === 'SIGNED_OUT') {
              // User explicitly signed out - reset state but don't redirect
              // Allow them to continue using the app in free mode
              setUser(null);
              setIsPremium(false);
            }
          }
        );

        authSubscription = subscription;

      } catch (err) {
        console.error('[app/page] Auth error:', err);
        // Don't redirect on auth errors - allow app to work in free mode
        // Only redirect if it's a critical parse error (handled above)
        // Still try to load history
        loadHistoryData(null);
      }
    };

    checkUser();

    return () => {
      mounted = false;
      authSubscription?.unsubscribe();
    };
  }, [router, supabase]);

  // Restore saved scroll position when switching tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const pos = scrollPositions.current[currentTab] || 0;
      // use instant restore to avoid jumping animation when switching tabs
      window.scrollTo({ top: pos, behavior: 'auto' });
    } catch (e) {
      // ignore
    }
  }, [currentTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleGeneratePrayer = async (intent: string, customMessage?: string) => {
    const effectiveName = localUserName || userDisplayName || user?.email?.split('@')[0] || "Friend";
    setIsGeneratingPrayer(true);
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
        prayerId: data.prayerId,
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // Trigger signup prompt after first personalized prayer
      if (!user && typeof window !== 'undefined') {
        const firstPrayerPromptShown = localStorage.getItem('selah_first_prayer_prompt_shown');
        const signupPromptShown = sessionStorage.getItem('selah_signup_prompt_shown');

        if (!firstPrayerPromptShown && !signupPromptShown) {
          setTimeout(() => {
            setSignupPromptType('first-prayer');
            setShowSignupPrompt(true);
            localStorage.setItem('selah_first_prayer_prompt_shown', 'true');
            sessionStorage.setItem('selah_signup_prompt_shown', 'true');
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Error generating prayer:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate prayer. Please try again.';
      alert(errorMessage);
    } finally {
      setIsGeneratingPrayer(false);
    }
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
            userName={localUserName || userDisplayName || user?.email?.split('@')[0] || "Friend"}
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
                  prayerId: data.prayerId,
                });
                setShowPrayerIntent(false);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);

                // Trigger signup prompt after first personalized prayer (primary growth point)
                if (!user && typeof window !== 'undefined') {
                  const firstPrayerPromptShown = localStorage.getItem('selah_first_prayer_prompt_shown');
                  const signupPromptShown = sessionStorage.getItem('selah_signup_prompt_shown');

                  if (!firstPrayerPromptShown && !signupPromptShown) {
                    // Show prompt after a brief delay (let them see the prayer first)
                    setTimeout(() => {
                      setSignupPromptType('first-prayer');
                      setShowSignupPrompt(true);
                      localStorage.setItem('selah_first_prayer_prompt_shown', 'true');
                      sessionStorage.setItem('selah_signup_prompt_shown', 'true');
                    }, 2000); // 2 second delay after prayer appears
                  }
                }
              } catch (err) {
                console.error('Error generating prayer:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to generate prayer. Please try again.';
                alert(errorMessage);
              }
            }}
            isGenerating={false}
          />
        </div>
        <BottomTabNavigation currentTab={currentTab} onTabChange={handleTabChange} isPremium={isPremium} />
      </div>
    );
  }

  // Show prayer player screen (when prayer is generated)
  if (currentPrayer && appFlow === "app") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A1628] to-[#1a2942] relative pb-20">
        <ScreenHeader
          title="Your Prayer"
          onBack={() => setCurrentPrayer(null)}
        />
        <div className="pt-20 pb-24">
          <PrayerPlayerScreen
            prayerText={currentPrayer.text}
            audioUrl={currentPrayer.audioUrl}
            prayerIntent={currentPrayer.intent}
            prayerId={currentPrayer.prayerId}
            userName={localUserName || userDisplayName || user?.email?.split('@')[0] || "Friend"}
            isPremium={isPremium}
            onNewPrayer={() => setShowPrayerIntent(true)}
            onShare={async () => {
              if (currentPrayer.prayerId) {
                const cardUrl = `${window.location.origin}/api/prayer/${currentPrayer.prayerId}/card`;
                if (navigator.share) {
                  try {
                    const response = await fetch(cardUrl);
                    const blob = await response.blob();
                    const file = new File([blob], 'prayer-card.png', { type: 'image/png' });
                    await navigator.share({
                      title: 'My Personalized Prayer',
                      text: currentPrayer.text.substring(0, 100) + '...',
                      files: [file],
                    });
                  } catch (error) {
                    await navigator.share({
                      title: 'My Personalized Prayer',
                      text: currentPrayer.text,
                    });
                  }
                } else {
                  await navigator.clipboard.writeText(cardUrl);
                  alert('Prayer card link copied to clipboard!');
                }
              } else {
                if (navigator.share) {
                  await navigator.share({
                    title: 'My Personalized Prayer',
                    text: currentPrayer.text,
                  });
                } else {
                  await navigator.clipboard.writeText(currentPrayer.text);
                  alert('Prayer copied to clipboard!');
                }
              }
            }}
          />
        </div>
        <BottomTabNavigation currentTab={currentTab} onTabChange={handleTabChange} isPremium={isPremium} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-20 md:pb-0 gradient-celestial overflow-hidden">
      {/* Star field background */}
      <StarField />
      
      {/* Nebula effects */}
      <div className="fixed inset-0 gradient-nebula pointer-events-none" />

      {/* Radial glow behind content for depth */}
      <div className="fixed inset-0 bg-gradient-radial from-[#D4A574]/5 via-[#D4A574]/2 to-transparent pointer-events-none opacity-60 animate-parallax-breathe" style={{ background: 'radial-gradient(circle at center, rgba(212,165,116,0.05) 0%, rgba(212,165,116,0.02) 40%, transparent 70%)' }} />

      <AnimatedBackground />

      {/* Fixed Header for Home Tab */}
      {currentTab === "home" && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Left: Selah Logo */}
            <h1 className="text-2xl font-display text-gradient-golden">Selah</h1>
            {/* Right: Notification Bell and Sign Out */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // TODO: Implement notifications
                }}
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                aria-label="Notifications"
              >
                <FaBell className="text-xl" />
              </button>
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors touch-manipulation"
                  aria-label="Sign Out"
                >
                  <FaSignOutAlt className="text-lg" />
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Conditional Headers - Only show for non-home tabs */}
      {currentTab === "prayers" && (
        <ScreenHeader
          title="Prayer Library"
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

      {/* Main Content Area */}
      <main className={`${currentTab === 'home' ? 'pt-16' : 'pt-16'} relative z-10`}>
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
                onNavigateToPrayers={() => handleTabChange("prayers")}
                onListenToPrayer={() => {
                  if (!isPremium) {
                    // Show upgrade modal for logged-in users, paywall for guests
                    if (user) {
                      setShowUpgradeModal(true);
                    } else {
                      setShowPaywall(true);
                    }
                  }
                }}
                isPremium={isPremium}
              />
            </motion.div>
          )}
          {currentTab === "prayers" && (
            <motion.div
              key="prayers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="pb-24"
            >
              <PrayerIntentScreen
                onGenerate={handleGeneratePrayer}
                isGenerating={isGeneratingPrayer}
                userName={localUserName || userDisplayName || user?.email?.split('@')[0] || "Friend"}
              />
            </motion.div>
          )}
          {currentTab === "feed" && (
            <FeedHistoryScreen
              userId={user?.id || 'anonymous'}
              historyData={historyData}
              userName={localUserName || userDisplayName || user?.email?.split('@')[0] || "Friend"}
              onRequireSignup={() => {
                // Trigger signup prompt when user tries to access history without account
                if (!user && typeof window !== 'undefined') {
                  const signupPromptShown = sessionStorage.getItem('selah_signup_prompt_shown');
                  if (!signupPromptShown) {
                    setSignupPromptType('save-history');
                    setShowSignupPrompt(true);
                    sessionStorage.setItem('selah_signup_prompt_shown', 'true');
                  }
                }
              }}
            />
          )}
          {currentTab === "profile" && (
            <ProfileScreen
              userId={user?.id || 'anonymous'}
              userName={localUserName || userDisplayName || user?.email?.split('@')[0]}
              userEmail={user?.email}
              isPremium={isPremium}
              isAuthenticated={!!user}
              onStartTrial={() => {
                // Show paywall for guests, upgrade modal for logged-in users
                if (user) {
                  setShowUpgradeModal(true);
                } else {
                  setShowPaywall(true);
                }
              }}
              onNameUpdate={(newName) => {
                setLocalUserName(newName);
              }}
              onSignOut={handleLogout}
              onManageSubscription={() => {
                // Show upgrade modal instead of redirecting to pricing
                setShowUpgradeModal(true);
              }}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomTabNavigation currentTab={currentTab} onTabChange={handleTabChange} isPremium={isPremium} />

      {/* Paywall Modal - For non-authenticated users */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSignInApple={async () => {
          // Redirect to auth page - signup/login required before checkout
          router.push("/auth?redirectTo=/app&prompt=upgrade");
          setShowPaywall(false);
        }}
        onSignInGoogle={async () => {
          // Redirect to auth page - signup/login required before checkout
          router.push("/auth?redirectTo=/app&prompt=upgrade");
          setShowPaywall(false);
        }}
        userName={user?.email || localUserName || userDisplayName || undefined}
      />

      {/* Upgrade Modal - For authenticated users */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          router.push('/pricing');
        }}
        userName={localUserName || userDisplayName || user?.email?.split('@')[0]}
        feature="voice prayers and worship songs"
      />

      {/* Signup Prompt (Non-Intrusive Growth Prompts) - Only render client-side to avoid hydration issues */}
      {isMounted && (
        <>
          <SignupPrompt
            show={showSignupPrompt && signupPromptType === 'first-prayer'}
            onClose={() => {
              setShowSignupPrompt(false);
              setSignupPromptType(null);
            }}
            title="Save your prayers"
            description="Create an account to save your prayers and receive a new one tomorrow."
            primaryAction="Save my prayers"
            secondaryAction="Maybe later"
          />

          <SignupPrompt
            show={showSignupPrompt && signupPromptType === 'share'}
            onClose={() => {
              setShowSignupPrompt(false);
              setSignupPromptType(null);
            }}
            title="Keep your prayers"
            description="Want to keep your prayers and come back to them later?"
            primaryAction="Create account"
            secondaryAction="Not now"
          />

          <SignupPrompt
            show={showSignupPrompt && signupPromptType === 'save-history'}
            onClose={() => {
              setShowSignupPrompt(false);
              setSignupPromptType(null);
            }}
            title="Sync across devices"
            description="Create an account to keep your prayers across devices."
            primaryAction="Create account"
            secondaryAction="Maybe later"
          />
        </>
      )}

      {showConfetti && <ConfettiPop show={showConfetti} onComplete={() => setShowConfetti(false)} />}
    </div>
  );
}