"use client";

import { useState } from "react";
import { prayers, Prayer, categories } from "@/data/prayers";
import { PrayerCard } from "@/components/PrayerCard";
import { PrayerPlayer } from "@/components/PrayerPlayer";
import { ShareablePrayerCard } from "@/components/ShareablePrayerCard";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Heart, Users, Share2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export type PrayerIntentType =
  | 'peace'
  | 'strength'
  | 'guidance'
  | 'healing'
  | 'gratitude'
  | 'comfort'
  | 'anxiety'
  | 'custom';

interface PrayerIntentScreenProps {
  onGenerate: (intent: PrayerIntentType, customMessage?: string, friendName?: string) => void;
  isGenerating?: boolean;
  userName: string;
}

export function PrayerIntentScreen({ onGenerate, isGenerating = false, userName }: PrayerIntentScreenProps) {
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [prayerInput, setPrayerInput] = useState('');
  const [showInput, setShowInput] = useState(true);
  const [isForFriend, setIsForFriend] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [lastGeneratedPrayer, setLastGeneratedPrayer] = useState<{ title: string; text: string; forFriend?: string } | null>(null);

  const filteredPrayers = selectedCategory
    ? prayers.filter(p => p.category === selectedCategory)
    : prayers;

  const generateLongPrayerText = (name: string, input: string, forFriend?: string) => {
    const prayerFor = forFriend || name;
    const isForOther = !!forFriend;

    // If praying for a friend/loved one, return a shorter ~20s prayer
    if (isForOther) {
      const short = `Heavenly Father, we lift up ${prayerFor} to You now. Hold ${prayerFor} in Your loving care and bring healing, peace, and strength for the days ahead. Give ${prayerFor} courage and comfort, and surround ${prayerFor} with Your presence. In Jesus' name, Amen.`;
      return short;
    }

    return `Gracious and Loving Heavenly Father,

We come into Your presence with hearts full of gratitude and reverence. Thank You for this sacred moment of prayer, where we can lay our burdens at Your feet and find rest in Your unfailing love.

Lord, ${isForOther ? `${name} lifts up ${prayerFor} to You today` : `${prayerFor} comes before You today`}. What weighs on ${isForOther ? 'their' : 'my'} heart is this: ${input}

Father, You know every detail of this situation. Nothing is hidden from Your sight, and nothing is too difficult for Your mighty hand. We trust that You are already working in ways we cannot see, orchestrating circumstances for good according to Your perfect will.

Grant ${prayerFor} Your divine peace that surpasses all understanding. Let it guard ${isForOther ? 'their' : 'my'} heart and mind in Christ Jesus. When anxiety tries to creep in, remind ${prayerFor} that You are in control and that Your plans are always good.

Pour out Your wisdom abundantly, Lord. Help ${prayerFor} to discern Your voice above all others and to walk in the path You have prepared. Give ${isForOther ? 'them' : 'me'} courage to take the next step, even when the way forward seems unclear.

Surround ${prayerFor} with Your presence. Let ${isForOther ? 'them' : 'me'} feel Your loving arms wrapped around ${isForOther ? 'them' : 'me'}, bringing comfort in moments of uncertainty and strength in times of weakness.

We declare Your faithfulness over this situation. You have been faithful in the past, You are faithful now, and You will continue to be faithful. Help ${prayerFor} to stand firm on this truth.

Lord, we also pray for supernatural strength. When ${prayerFor}'s own strength fails, may Your power be made perfect in weakness. Renew ${isForOther ? 'their' : 'my'} spirit day by day and help ${isForOther ? 'them' : 'me'} to run this race with endurance.

May ${prayerFor} experience Your joy—not a joy dependent on circumstances, but the deep, abiding joy that comes from knowing You. Let this joy be ${isForOther ? 'their' : 'my'} strength.

We commit this prayer and every concern into Your capable hands, trusting that You hear us and that You are faithful to answer. May Your will be done, and may ${prayerFor} have the grace to accept Your answer with a peaceful heart.

Thank You, Father, for Your endless love, Your constant presence, and Your promise never to leave or forsake us. We rest in You.

In the precious and powerful name of Jesus Christ, our Lord and Savior, we pray.

Amen.`;
  };

  const handleGeneratePrayer = async () => {
    if (!prayerInput.trim()) return;
    if (isForFriend && !friendName.trim()) return;
    
    // Use 'custom' intent for textarea input
    onGenerate('custom', prayerInput, isForFriend ? friendName : undefined);
    
    // Also store locally for immediate display
    const prayerText = generateLongPrayerText(userName, prayerInput, isForFriend ? friendName : undefined);
    const prayerTitle = isForFriend ? `Prayer for ${friendName}` : 'Personal Prayer';
    
    const generatedPrayer: Prayer = {
      id: `generated-${Date.now()}`,
      title: prayerTitle,
      category: 'peace',
      duration: isForFriend ? '20 sec' : '2 min',
      text: prayerText,
    };
    
    // Store in generated prayers history
    const stored = JSON.parse(localStorage.getItem('generatedPrayers') || '[]');
    const newPrayer = {
      id: Date.now(),
      text: generatedPrayer.text,
      title: generatedPrayer.title,
      input: prayerInput,
      forFriend: isForFriend ? friendName : undefined,
      date: new Date().toISOString(),
    };
    localStorage.setItem('generatedPrayers', JSON.stringify([newPrayer, ...stored]));
    
    setLastGeneratedPrayer({
      title: prayerTitle,
      text: prayerText,
      forFriend: isForFriend ? friendName : undefined,
    });
    
    setPrayerInput('');
    setFriendName('');
    setIsForFriend(false);
    setShowInput(false);
    setSelectedPrayer(generatedPrayer);
  };

  if (selectedPrayer) {
    return (
      <>
        <PrayerPlayer 
          prayer={selectedPrayer} 
          onClose={() => {
            setSelectedPrayer(null);
            setShowInput(true);
          }} 
          userName={userName}
          forFriend={lastGeneratedPrayer?.forFriend}
          autoPlay={true}
        />
        {/* Share button overlay removed to avoid auto-switching to share UI */}
        {lastGeneratedPrayer && (
          <ShareablePrayerCard
            isOpen={showShareDialog}
            onClose={() => setShowShareDialog(false)}
            prayerTitle={lastGeneratedPrayer.title}
            prayerText={lastGeneratedPrayer.text}
            forFriend={lastGeneratedPrayer.forFriend}
          />
        )}
      </>
    );
  }

  return (
    <div className="px-4 pt-6 pb-28">
      {/* Fixed Header */}
      <header className="mb-6 sticky top-16 z-30 bg-background/80 backdrop-blur-sm pb-4 -mx-4 px-4">
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-gradient-golden">
          Prayer Library
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create your personal prayer or choose from our collection
        </p>
      </header>

      {/* Prayer Input Section */}
      {showInput && (
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-medium text-foreground">
              What would you like to pray about?
            </h2>
          </div>
          
          {/* Pray for friend toggle */}
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-background/50 border border-border/20">
            <button
              onClick={() => setIsForFriend(!isForFriend)}
              aria-pressed={isForFriend}
              className={`w-12 h-6 rounded-full transition-colors ${isForFriend ? 'bg-[#D4A574]' : 'bg-[#8B9DC3]/30'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isForFriend ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
            </button>
            <Label className="flex items-center gap-2 cursor-pointer">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Pray for loved ones</span>
            </Label>
          </div>

          {/* Friend name input */}
          {isForFriend && (
            <Input
              value={friendName}
              onChange={(e) => {
                // Accept only a single token (first name) and limit length to 30 chars
                const raw = e.target.value || '';
                const first = raw.trim().split(/\s+/)[0] || '';
                setFriendName(first.slice(0, 30));
              }}
              placeholder="Enter a loved one's given name"
              className="mb-4 bg-background/50 border-border/50 focus:border-primary/50 placeholder-white/60 text-white"
              maxLength={30}
            />
          )}
          
          <Textarea
            value={prayerInput}
            onChange={(e) => setPrayerInput(e.target.value)}
            placeholder={isForFriend 
              ? "What would you like to pray for them? (e.g., healing, guidance, peace, strength...)"
              : "Share what's on your heart... (e.g., peace for my family, guidance for a decision, gratitude for blessings)"
            }
            className="min-h-[100px] bg-background/50 border-border/50 focus:border-primary/50 resize-none mb-4"
            maxLength={500}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {prayerInput.length}/500
            </span>
            <Button
              onClick={handleGeneratePrayer}
              disabled={!prayerInput.trim() || isGenerating || (isForFriend && !friendName.trim())}
              className="text-primary-foreground"
              style={{ backgroundColor: '#E6D3B3', color: '#352714' }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Prayer...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Pray With Me
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6 py-2 h-14">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
            !selectedCategory
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2",
              selectedCategory === cat.id
                ? "bg-[#E6D3B3] text-[#352714] shadow-lg shadow-[#E6D3B3]/25 scale-105"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            )}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Prayer List */}
      <div className="space-y-3">
        {filteredPrayers.map((prayer) => (
          <PrayerCard
            key={prayer.id}
            prayer={prayer}
            onClick={() => setSelectedPrayer(prayer)}
            active={Boolean(selectedPrayer && (selectedPrayer as any).id === prayer.id)}
          />
        ))}
      </div>
    </div>
  );
}
