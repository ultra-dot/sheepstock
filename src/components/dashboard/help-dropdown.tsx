"use client";

import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, MessageCircle } from "lucide-react";

export function HelpDropdown() {
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
    <div className="relative hidden sm:block" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-10 h-10 items-center justify-center rounded-xl transition-all cursor-pointer ${isOpen ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        title="Pusat Bantuan"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-emerald-900/10 border border-slate-100 dark:border-slate-800 z-50 overflow-hidden transform opacity-100 scale-100 transition-all">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <span className="text-sm font-bold text-slate-800 dark:text-white">Pusat Bantuan</span>
            <p className="text-[10px] text-slate-500 mt-0.5">SheepStock v1.0.0</p>
          </div>
          
          <div className="p-2">
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <p>Hubungi Support</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight mt-0.5">Chat IT Support via WA</p>
              </div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
