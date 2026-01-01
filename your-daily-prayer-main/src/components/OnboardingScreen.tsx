import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StarField } from '@/components/StarField';
import { Moon } from '@/components/Moon';
import { Sparkles } from 'lucide-react';

export function OnboardingScreen() {
  const [name, setName] = useState('');
  const { completeOnboarding } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      completeOnboarding(name.trim());
    }
  };

  return (
    <div className="min-h-screen gradient-celestial flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Star field */}
      <StarField />
      
      {/* Nebula effects */}
      <div className="fixed inset-0 gradient-nebula pointer-events-none" />
      
      {/* Cosmic glow orbs */}
      <div className="absolute bottom-32 right-10 w-40 h-40 rounded-full bg-accent/10 blur-3xl breathing-glow" />
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl breathing-glow" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Moon decoration */}
        <div className="flex justify-center mb-6">
          <Moon />
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-semibold text-gradient-golden mb-3">
            Sacred Moments
          </h1>
          <p className="text-muted-foreground font-body leading-relaxed">
            A peaceful space for personalized prayer and spiritual reflection under the stars
          </p>
        </div>

        {/* Features */}
        <div className="mb-8 space-y-3 text-left">
          {[
            { icon: '✨', text: 'Personalized prayers with your name' },
            { icon: '🎵', text: 'Calming ambient soundscapes' },
            { icon: '🗣️', text: 'Voice narration for hands-free listening' },
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-border/20 backdrop-blur-sm"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <span className="text-xl">{feature.icon}</span>
              <span className="text-sm text-foreground/80">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-14 text-center text-lg bg-card/50 border-border/50 focus:border-primary/50 placeholder:text-muted-foreground/50"
              maxLength={30}
            />
          </div>
          
          <Button
            type="submit"
            disabled={!name.trim()}
            className="w-full h-14 text-lg font-display font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-300 disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Begin Your Journey
          </Button>
        </form>
      </div>
    </div>
  );
}
