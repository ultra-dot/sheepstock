"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Users, Settings, LogOut, LayoutDashboard } from "lucide-react";

export function UserDropdown({ userName = "Admin", avatarUrl, showName = false }: { userName?: string, avatarUrl: string | null, showName?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 -m-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
      >
        {showName && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{userName}</p>
            <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">ONLINE</span>
          </div>
        )}
        {avatarUrl ? (
          <img
            className="w-10 h-10 rounded-full border border-slate-200 group-hover:ring-2 group-hover:ring-emerald-500/30 object-cover transition-all"
            alt="Profile"
            src={avatarUrl}
          />
        ) : (
          <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 group-hover:ring-2 group-hover:ring-emerald-500/30 transition-all">
            <Users className="w-5 h-5" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-emerald-900/10 border border-slate-100 dark:border-slate-800 z-50 overflow-hidden transform opacity-100 scale-100 transition-all">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/30">
            {avatarUrl ? (
               <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
            ) : (
               <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center">
                 <Users className="w-5 h-5 text-slate-400" />
               </div>
            )}
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate">{userName}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Administrator</span>
            </div>
          </div>
          
          <div className="p-2">
            <Link 
              href="/settings" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <Settings className="w-4 h-4" />
              </div>
              <span>Pengaturan</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
