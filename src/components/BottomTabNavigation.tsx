"use client";

import { Home, BookOpen, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = "home" | "prayers" | "feed" | "profile";

interface BottomTabNavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isPremium?: boolean;
}

const tabs = [
  { id: 'home' as TabType, label: 'Home', icon: Home },
  { id: 'prayers' as TabType, label: 'Prayers', icon: BookOpen },
  { id: 'feed' as TabType, label: 'History', icon: Clock },
  { id: 'profile' as TabType, label: 'Profile', icon: User },
];

export function BottomTabNavigation({ currentTab, onTabChange, isPremium = false }: BottomTabNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/100 md:bg-card/90 backdrop-blur-xl border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around py-1 px-4 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-300",
                isActive 
                  ? "text-selah-wood-dark scale-105"
                  : "text-muted-foreground hover:text-selah-wood-dark"
              )}
            >
              <div className={cn(
                "relative p-1 rounded-full transition-all duration-300 hover:bg-selah-wood/10",
                isActive && "bg-selah-wood/20"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive && "drop-shadow-[0_0_8px_rgba(53,39,20,0.6)]"
                )} />
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-selah-wood/10 blur-md" />
                )}
              </div>
              <span className={cn(
                "text-xs mt-1 font-medium transition-all duration-300",
                isActive ? "text-selah-wood-dark" : "text-muted-foreground"
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
