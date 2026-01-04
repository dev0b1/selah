"use client";

import { useState, useEffect } from "react";
import { Clock, Trash2, Play, Share2 } from "lucide-react";
import { format } from "date-fns";
import { Prayer } from "@/data/prayers";
import { PrayerPlayer } from "@/components/PrayerPlayer";
import { ShareablePrayerCard } from "@/components/ShareablePrayerCard";

interface GeneratedPrayer {
  id: number;
  text: string;
  title: string;
  input: string;
  forFriend?: string;
  date: string;
}

interface FeedHistoryScreenProps {
  userId: string;
  onRequireSignup?: () => void;
  historyData?: any[];
  userName?: string;
}

export function FeedHistoryScreen({ userId, onRequireSignup, historyData = [], userName = "" }: FeedHistoryScreenProps) {
  const [prayers, setPrayers] = useState<GeneratedPrayer[]>([]);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [selectedForFriend, setSelectedForFriend] = useState<string | undefined>();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [prayerToShare, setPrayerToShare] = useState<GeneratedPrayer | null>(null);

  useEffect(() => {
    // Use provided historyData or load from localStorage
    if (historyData && historyData.length > 0) {
      const converted = historyData.map((p: any) => ({
        id: p.id || Date.now(),
        text: p.prayerText || p.text || '',
        title: p.title || (p.need ? `${p.need.charAt(0).toUpperCase() + p.need.slice(1)} Prayer` : 'Personal Prayer'),
        input: p.message || p.input || '',
        forFriend: p.forFriend,
        date: p.createdAt || p.date || new Date().toISOString(),
      }));
      setPrayers(converted);
    } else {
      // Fallback to localStorage
      const stored = JSON.parse(localStorage.getItem('generatedPrayers') || '[]');
      setPrayers(stored);
    }
  }, [historyData]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this prayer?")) return;

    try {
      // Try to delete from API
      if (userId && userId !== 'anonymous') {
        const res = await fetch(`/api/prayer/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prayerId: id.toString(), userId }),
        });
        if (res.ok) {
          setPrayers(prayers.filter((p) => p.id !== id));
          return;
        }
      }
      
      // Fallback to localStorage
      const updated = prayers.filter(p => p.id !== id);
      setPrayers(updated);
      localStorage.setItem('generatedPrayers', JSON.stringify(updated));
    } catch (error) {
      console.error("Error deleting prayer:", error);
      // Fallback to localStorage
      const updated = prayers.filter(p => p.id !== id);
      setPrayers(updated);
      localStorage.setItem('generatedPrayers', JSON.stringify(updated));
    }
  };

  const handlePlay = (prayer: GeneratedPrayer) => {
    const prayerToPlay: Prayer = {
      id: `generated-${prayer.id}`,
      title: prayer.title,
      category: 'peace',
      duration: '2 min',
      text: prayer.text,
    };
    setSelectedPrayer(prayerToPlay);
    setSelectedForFriend(prayer.forFriend);
  };

  const handleShare = (prayer: GeneratedPrayer) => {
    setPrayerToShare(prayer);
    setShareDialogOpen(true);
  };

  if (selectedPrayer) {
    return <PrayerPlayer prayer={selectedPrayer} onClose={() => setSelectedPrayer(null)} forFriend={selectedForFriend} userName={userName} autoPlay={true} />;
  }


  return (
    <div className="px-4 pt-6 pb-28">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-gradient-golden">
          Prayer History
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your personal prayers, ready to listen again
        </p>
      </header>

      {prayers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-8 h-8 text-primary/50" />
          </div>
          <h3 className="text-lg font-display text-foreground mb-2">No prayers yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Go to the Prayers tab to create your first personalized prayer
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {prayers.map((prayer) => (
            <div
              key={prayer.id}
              className="p-4 rounded-xl bg-card/60 border border-border/30 backdrop-blur-sm relative group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-medium text-foreground mb-1">
                    {prayer.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {format(new Date(prayer.date), 'MMM d, yyyy • h:mm a')}
                  </p>
                  <p className="text-sm text-muted-foreground/80 line-clamp-2">
                    {prayer.forFriend ? `Prayed for ${prayer.forFriend}: ` : 'Prayed for: '}{prayer.input}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlay(prayer)}
                    className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Listen"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleShare(prayer)}
                    className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prayer.id)}
                    className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Dialog */}
      {prayerToShare && (
        <ShareablePrayerCard
          isOpen={shareDialogOpen}
          onClose={() => {
            setShareDialogOpen(false);
            setPrayerToShare(null);
          }}
          prayerTitle={prayerToShare.title}
          prayerText={prayerToShare.text}
          forFriend={prayerToShare.forFriend}
        />
      )}
    </div>
  );
}
