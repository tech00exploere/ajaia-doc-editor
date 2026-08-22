'use client';

import React from 'react';
import Link from 'next/link';
import { useUser, SEEDED_USERS } from '@/context/UserContext';
import { FileText, ShieldCheck, Sparkles } from 'lucide-react';

export function Navbar() {
  const { currentUser, setCurrentUser } = useUser();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="bg-gradient-to-tr from-brand-600 to-indigo-600 text-white p-2 rounded-xl shadow-md group-hover:scale-105 transition transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-gray-900 text-lg tracking-tight group-hover:text-brand-600 transition">
                Ajaia Docs
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                🇮🇳 India
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium hidden sm:block">
              AI-Native Collaborative Workspace
            </p>
          </div>
        </Link>

        {/* User Switcher (Simulated Auth) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-gray-700 flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Demo Auth Session
            </span>
            <span className="text-[11px] text-gray-400">Switch user to test RBAC roles</span>
          </div>

          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1.5 gap-2 hover:border-brand-300 transition shadow-inner">
            <img
              src={currentUser.avatar || 'https://via.placeholder.com/40'}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-brand-200 shrink-0"
            />
            <select
              value={currentUser.id}
              onChange={(e) => {
                const user = SEEDED_USERS.find((u) => u.id === e.target.value);
                if (user) setCurrentUser(user);
              }}
              className="bg-transparent text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer pr-1 max-w-[140px] sm:max-w-none truncate"
            >
              {SEEDED_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email.split('@')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
