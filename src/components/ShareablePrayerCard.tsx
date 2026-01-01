import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Share2, Copy, MessageCircle, Twitter, Facebook, Mail, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShareablePrayerCardProps {
  isOpen: boolean;
  onClose: () => void;
  prayerTitle: string;
  prayerText: string;
  forFriend?: string;
}

export function ShareablePrayerCard({ isOpen, onClose, prayerTitle, prayerText, forFriend }: ShareablePrayerCardProps) {
  const [copied, setCopied] = React.useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareText = forFriend 
    ? `🙏 A Prayer for ${forFriend}\n\n${prayerText}\n\n— Shared with love via SelahPrayer.com`
    : `🙏 ${prayerTitle}\n\n${prayerText}\n\n— SelahPrayer.com`;

  const encodedText = encodeURIComponent(shareText);
  const shareUrl = 'https://selahprayer.com';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({ title: 'Copied to clipboard!', description: 'Share this prayer with someone special.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      url: `https://wa.me/?text=${encodedText}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodedText}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}&u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-muted hover:bg-muted/80',
      url: `mailto:?subject=${encodeURIComponent(forFriend ? `A Prayer for ${forFriend}` : prayerTitle)}&body=${encodedText}`,
    },
  ];

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-none">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Prayer Card Preview */}
          <div 
            ref={cardRef}
            className="relative p-6 rounded-t-2xl bg-gradient-to-br from-background via-card to-background border border-border/30"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden rounded-t-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              {/* Logo/Branding */}
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🙏</span>
                  <span className="text-lg font-display font-semibold text-gradient-golden">SelahPrayer</span>
                </div>
              </div>

              {/* Prayer Title */}
              <h3 className="text-lg font-display font-medium text-foreground text-center mb-4">
                {forFriend ? `A Prayer for ${forFriend}` : prayerTitle}
              </h3>

              {/* Prayer Text */}
              <div className="max-h-64 overflow-y-auto scrollbar-hide">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line text-center">
                  {prayerText.length > 500 ? `${prayerText.substring(0, 500)}...` : prayerText}
                </p>
              </div>

              {/* Website */}
              <div className="mt-4 pt-4 border-t border-border/30 text-center">
                <span className="text-xs text-primary font-medium">selahprayer.com</span>
              </div>
            </div>
          </div>

          {/* Share Options */}
          <div className="p-4 bg-card rounded-b-2xl border-x border-b border-border/30">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-center flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Share this Prayer
              </DialogTitle>
            </DialogHeader>

            {/* Share buttons */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {shareLinks.map((link) => (
                <Button
                  key={link.name}
                  variant="ghost"
                  onClick={() => handleShare(link.url)}
                  className={`flex flex-col items-center gap-1 h-auto py-3 ${link.color} text-white`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="text-xs">{link.name}</span>
                </Button>
              ))}
            </div>

            {/* Copy button */}
            <Button
              variant="outline"
              onClick={handleCopy}
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Prayer Text
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

