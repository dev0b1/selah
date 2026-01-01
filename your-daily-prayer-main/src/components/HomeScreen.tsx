import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { prayers, categories, Prayer } from '@/data/prayers';
import { PrayerCard } from './PrayerCard';
import { PrayerPlayer } from './PrayerPlayer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Send, Heart } from 'lucide-react';

export function HomeScreen() {
  const { userName, resetOnboarding } = useUser();
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [prayerRequest, setPrayerRequest] = useState('');
  const [isRequestSubmitted, setIsRequestSubmitted] = useState(false);

  const handleSubmitRequest = () => {
    if (prayerRequest.trim()) {
      // Store in localStorage for now
      const requests = JSON.parse(localStorage.getItem('prayerRequests') || '[]');
      requests.push({
        id: Date.now(),
        text: prayerRequest,
        date: new Date().toISOString()
      });
      localStorage.setItem('prayerRequests', JSON.stringify(requests));
      setPrayerRequest('');
      setIsRequestSubmitted(true);
      setTimeout(() => setIsRequestSubmitted(false), 3000);
    }
  };

  const filteredPrayers = selectedCategory
    ? prayers.filter(p => p.category === selectedCategory)
    : prayers;

  if (selectedPrayer) {
    return <PrayerPlayer prayer={selectedPrayer} onClose={() => setSelectedPrayer(null)} />;
  }

  // Get time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 gradient-radial-glow opacity-30" />
      <div className="absolute top-10 right-10 w-48 h-48 rounded-full bg-primary/5 blur-3xl breathing-glow" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-start justify-between mb-8">
          <div className="space-y-1">
            <p className="text-muted-foreground font-body">{getGreeting()},</p>
            <h1 className="text-3xl md:text-4xl font-display font-semibold text-gradient-golden">
              {userName}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetOnboarding}
            className="text-muted-foreground hover:text-foreground"
            title="Reset name"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </header>

        {/* Daily inspiration */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/30 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground mb-2">Today's Verse</p>
          <blockquote className="text-lg md:text-xl font-body text-foreground/90 italic leading-relaxed">
            "Be still, and know that I am God."
          </blockquote>
          <cite className="text-sm text-muted-foreground mt-2 block">— Psalm 46:10</cite>
        </div>

        {/* Prayer Request / Vent Section */}
        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-medium text-foreground">
              What's on your heart?
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Share your burdens, worries, or prayers. God hears every word.
          </p>
          <Textarea
            value={prayerRequest}
            onChange={(e) => setPrayerRequest(e.target.value)}
            placeholder="Pour out your heart here... What do you need prayer for today?"
            className="min-h-[100px] bg-background/50 border-border/50 focus:border-primary/50 resize-none mb-4"
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {prayerRequest.length}/1000
            </span>
            {isRequestSubmitted ? (
              <div className="flex items-center gap-2 text-primary animate-fade-in">
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">Lifted up in prayer</span>
              </div>
            ) : (
              <Button
                onClick={handleSubmitRequest}
                disabled={!prayerRequest.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Prayer
              </Button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/50'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prayers grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All'} Prayers
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPrayers.map(prayer => (
              <PrayerCard
                key={prayer.id}
                prayer={prayer}
                onClick={() => setSelectedPrayer(prayer)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-muted-foreground/60">
          <p>Sacred Moments • Made with 🙏</p>
        </footer>
      </div>
    </div>
  );
}
