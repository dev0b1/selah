import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { StarField } from '@/components/StarField';
import { BottomNav, TabType } from '@/components/BottomNav';
import { HomeTab } from '@/components/tabs/HomeTab';
import { PrayersTab } from '@/components/tabs/PrayersTab';
import { HistoryTab } from '@/components/tabs/HistoryTab';
import { ProfileTab } from '@/components/tabs/ProfileTab';

const Index = () => {
  const { isOnboarded } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('home');

  if (!isOnboarded) {
    return <OnboardingScreen />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'prayers':
        return <PrayersTab />;
      case 'history':
        return <HistoryTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen gradient-celestial relative overflow-hidden">
      {/* Star field background */}
      <StarField />
      
      {/* Nebula effects */}
      <div className="fixed inset-0 gradient-nebula pointer-events-none" />
      
      {/* Main content */}
      <main className="relative z-10 max-w-lg mx-auto min-h-screen">
        {renderTab()}
      </main>
      
      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
