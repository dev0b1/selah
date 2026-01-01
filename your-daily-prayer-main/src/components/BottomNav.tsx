import React from 'react';
import { Home, BookOpen, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'home' | 'prayers' | 'history' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { id: 'home' as TabType, label: 'Home', icon: Home },
  { id: 'prayers' as TabType, label: 'Prayers', icon: BookOpen },
  { id: 'history' as TabType, label: 'History', icon: Clock },
  { id: 'profile' as TabType, label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around py-2 px-4 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "text-primary scale-105" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-full transition-all duration-300",
                isActive && "bg-primary/20"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive && "drop-shadow-[0_0_8px_hsl(var(--primary))]"
                )} />
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-primary/10 blur-md" />
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 font-medium transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
