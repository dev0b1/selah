import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Moon } from '@/components/Moon';
import { prayers, Prayer, categories } from '@/data/prayers';
import { PrayerCard } from '@/components/PrayerCard';
import { PrayerPlayer } from '@/components/PrayerPlayer';
import { Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GeneratedPrayer {
  id: number;
  text: string;
  title: string;
  date: string;
}

export function HomeTab() {
  const { userName } = useUser();
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [todaysPrayer, setTodaysPrayer] = useState<GeneratedPrayer | null>(null);
  
  // Get featured prayers (one from each category)
  const featuredPrayers = categories.slice(0, 3).map(cat => 
    prayers.find(p => p.category === cat.id)
  ).filter(Boolean) as Prayer[];

  useEffect(() => {
    // Get today's generated prayer from history
    const stored = JSON.parse(localStorage.getItem('generatedPrayers') || '[]');
    const today = new Date().toDateString();
    const todayPrayer = stored.find((p: GeneratedPrayer) => 
      new Date(p.date).toDateString() === today
    );
    if (todayPrayer) {
      setTodaysPrayer(todayPrayer);
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handlePlayTodaysPrayer = () => {
    if (todaysPrayer) {
      const prayerToPlay: Prayer = {
        id: `generated-${todaysPrayer.id}`,
        title: todaysPrayer.title,
        category: 'peace',
        duration: '2 min',
        text: todaysPrayer.text,
      };
      setSelectedPrayer(prayerToPlay);
    }
  };

  if (selectedPrayer) {
    return <PrayerPlayer prayer={selectedPrayer} onClose={() => setSelectedPrayer(null)} />;
  }

  return (
    <div className="px-4 pt-6 pb-28">
      {/* Header with Moon */}
      <header className="relative mb-8">
        <div className="absolute -top-2 right-0">
          <Moon className="scale-75 md:scale-100" />
        </div>
        
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
      <div className="mb-6 p-5 rounded-2xl bg-card/60 border border-border/30 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="relative">
          <p className="text-xs text-primary mb-2 font-medium tracking-wide uppercase">Today's Verse</p>
          <blockquote className="text-lg md:text-xl font-display text-foreground/90 italic leading-relaxed">
            "Be still, and know that I am God."
          </blockquote>
          <cite className="text-sm text-muted-foreground mt-3 block">— Psalm 46:10</cite>
        </div>
      </div>

      {/* Today's Prayer Section */}
      {todaysPrayer && (
        <section className="mb-6">
          <h2 className="text-xl font-display font-medium text-foreground mb-4 flex items-center gap-2">
            <span className="text-2xl">🙏</span>
            Today's Prayer
          </h2>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative">
              <h3 className="font-display font-medium text-foreground mb-2">
                {todaysPrayer.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                {todaysPrayer.text.substring(0, 100)}...
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
            />
          ))}
        </div>
      </section>
    </div>
  );
}
