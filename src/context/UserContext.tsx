'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

export const SEEDED_USERS: User[] = [
  {
    id: 'user-priyanshu',
    name: 'Priyanshu Sharma',
    email: 'priyanshu@ajaia.in',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'user-aarav',
    name: 'Aarav Patel',
    email: 'aarav@ajaia.in',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'user-ananya',
    name: 'Ananya Verma',
    email: 'ananya@ajaia.in',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
];

interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(SEEDED_USERS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUserId = localStorage.getItem('ajaia_demo_user');
    if (savedUserId) {
      const found = SEEDED_USERS.find((u) => u.id === savedUserId);
      if (found) setCurrentUser(found);
    }
  }, []);

  const handleSetCurrentUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('ajaia_demo_user', user.id);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        users: SEEDED_USERS,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
