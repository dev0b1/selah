import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserContextType {
  userName: string;
  setUserName: (name: string) => void;
  isOnboarded: boolean;
  completeOnboarding: (name: string) => void;
  resetOnboarding: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState('');
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('prayer-app-user-name');
    if (storedName) {
      setUserName(storedName);
      setIsOnboarded(true);
    }
  }, []);

  const completeOnboarding = (name: string) => {
    setUserName(name);
    setIsOnboarded(true);
    localStorage.setItem('prayer-app-user-name', name);
  };

  const resetOnboarding = () => {
    setUserName('');
    setIsOnboarded(false);
    localStorage.removeItem('prayer-app-user-name');
  };

  return (
    <UserContext.Provider value={{ userName, setUserName, isOnboarded, completeOnboarding, resetOnboarding }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
