import React from 'react';
import { Prayer, categories } from '@/data/prayers';
import { Card } from '@/components/ui/card';

interface PrayerCardProps {
  prayer: Prayer;
  onClick: () => void;
}

export function PrayerCard({ prayer, onClick }: PrayerCardProps) {
  const category = categories.find(c => c.id === prayer.category);

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer p-6 bg-card/50 border-border/30 backdrop-blur-sm hover:bg-card/80 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
          {category?.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl font-medium text-foreground group-hover:text-primary transition-colors">
            {prayer.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">{category?.name}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-sm text-muted-foreground">{prayer.duration}</span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </Card>
  );
}

