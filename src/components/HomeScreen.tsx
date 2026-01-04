"use client";

import { useState, useEffect } from "react";
import { Moon } from "@/components/Moon";
import { prayers, Prayer, categories } from "@/data/prayers";
import { PrayerCard } from "@/components/PrayerCard";
import { PrayerPlayer } from "@/components/PrayerPlayer";
import { getTodaysVerse, type BibleVerse } from "@/lib/bible-verses";
import { Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GeneratedPrayer {
  id: number;
  text: string;
  title: string;
  date: string;
}

interface HomeScreenProps {
  userName: string;
  todaysPrayer?: {
    text: string;
    audioUrl?: string;
  };
  onPrayForSomething: () => void;
  onListenToPrayer?: () => void;
  onSelectIntent?: (intent: string) => void;
  onNotificationsClick?: () => void;
  onNavigateToPrayers?: () => void;
  isPremium?: boolean;
}

export function HomeScreen({
  userName,
  todaysPrayer,
  onNavigateToPrayers,
  onPrayForSomething,
}: HomeScreenProps) {
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [todaysGeneratedPrayer, setTodaysGeneratedPrayer] = useState<GeneratedPrayer | null>(null);
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  
  // Get featured prayers (one from each category)
  const featuredPrayers = categories.slice(0, 3).map(cat => 
    prayers.find(p => p.category === cat.id)
  ).filter(Boolean) as Prayer[];

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const res = await fetch('/api/verse/today');
        if (res.ok) {
          const data = await res.json();
          setVerse(data);
        } else {
          setVerse(getTodaysVerse());
        }
      } catch (error) {
        setVerse(getTodaysVerse());
      }
    };
    fetchVerse();

    // Get today's generated prayer from history
    const stored = JSON.parse(localStorage.getItem('generatedPrayers') || '[]');
    const today = new Date().toDateString();
    const todayPrayer = stored.find((p: GeneratedPrayer) => 
      new Date(p.date).toDateString() === today
    );
    if (todayPrayer) {
      setTodaysGeneratedPrayer(todayPrayer);
    } else if (todaysPrayer) {
      // Use provided prayer if no stored prayer for today
      setTodaysGeneratedPrayer({
        id: Date.now(),
        text: todaysPrayer.text,
        title: 'Your Personalized Prayer',
        date: new Date().toISOString(),
      });
    }
  }, [todaysPrayer]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handlePlayTodaysPrayer = () => {
    if (todaysGeneratedPrayer) {
      const prayerToPlay: Prayer = {
        id: `generated-${todaysGeneratedPrayer.id}`,
        title: todaysGeneratedPrayer.title,
        category: 'peace',
        duration: '2 min',
        text: todaysGeneratedPrayer.text,
      };
      setSelectedPrayer(prayerToPlay);
    }
  };

  if (selectedPrayer) {
    return <PrayerPlayer prayer={selectedPrayer} onClose={() => setSelectedPrayer(null)} userName={userName} />;
  }

  return (
    <div className="px-4 pt-6 pb-28">
      {/* Header with Moon */}
      <header className="relative mb-8">

        <div className="pr-24">
          <p className="text-muted-foreground text-sm mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {getGreeting()}
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-gradient-golden">
            {userName}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-body">
            A moment of peace awaits you
          </p>
              </div>
      </header>

      {/* Daily Verse Card */}
      {verse && (
        <div className="mb-6 p-5 rounded-2xl bg-card/60 border border-border/30 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <div className="relative">
            <p className="text-xs text-primary mb-2 font-medium tracking-wide uppercase">Today's Verse</p>
            <blockquote className="text-lg md:text-xl font-display text-foreground/90 italic leading-relaxed">
              "{verse.text}"
            </blockquote>
            <cite className="text-sm text-muted-foreground mt-3 block">— {verse.reference}</cite>
                    </div>
                    </div>
      )}

      {/* Today's Prayer Section */}
      {todaysGeneratedPrayer && (
        <section className="mb-6">
          <h2 className="text-xl font-display font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">🙏</span>
            Today's Prayer
          </h2>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative">
              <h3 className="font-display font-medium text-foreground mb-2">
                {todaysGeneratedPrayer.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                {todaysGeneratedPrayer.text.substring(0, 100)}...
              </p>
              <Button
                onClick={handlePlayTodaysPrayer}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Listen Now
              </Button>
                    </div>
                    </div>
        </section>
      )}

      {/* Featured Prayers */}
      <section>
        <h2 className="text-xl font-display font-medium text-foreground mb-4 flex items-center gap-2">
          <span className="text-2xl">✨</span>
          Featured Prayers
          </h2>
        <div className="space-y-3">
          {featuredPrayers.map((prayer) => (
            <PrayerCard
              key={prayer.id}
              prayer={prayer}
              onClick={() => setSelectedPrayer(prayer)}
              active={Boolean(selectedPrayer && (selectedPrayer as any).id === prayer.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
