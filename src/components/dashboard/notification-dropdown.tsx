"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, AlertCircle, CheckCircle2, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";

export type NotificationLog = {
  id: string;
  description: string;
  created_at: string;
  action: string;
};

export function NotificationDropdown({ notifications = [], userRole = 'staff' }: { notifications?: NotificationLog[], userRole?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [clearedAt, setClearedAt] = useState<number | null>(null);
  const [stockNotif, setStockNotif] = useState(true);
  const [vaccineNotif, setVaccineNotif] = useState(true);

  useEffect(() => {
    const savedTime = localStorage.getItem('notifications_cleared_at');
    if (savedTime) {
      setClearedAt(parseInt(savedTime, 10));
    }
    setStockNotif(localStorage.getItem('setting_stock_notif') !== 'false');
    setVaccineNotif(localStorage.getItem('setting_vaccine_notif') !== 'false');
  }, [isOpen]); // re-check when dropdown opens

  const visibleNotifications = notifications.filter(n => {
    if (n.action === 'ALERT_STOCK' && !stockNotif) return false;
    if (n.action === 'ALERT_VACCINE' && !vaccineNotif) return false;
    return !clearedAt || new Date(n.created_at).getTime() > clearedAt;
  });

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    setHasUnread(visibleNotifications.length > 0 && !isOpen);
  }, [visibleNotifications.length]);
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

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const handleClearAll = () => {
    const now = Date.now();
    localStorage.setItem('notifications_cleared_at', now.toString());
    setClearedAt(now);
    setHasUnread(false);
  };

  const getIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full"><CheckCircle2 className="w-4 h-4" /></div>;
      case 'UPDATE':
        return <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full"><Edit2 className="w-4 h-4" /></div>;
      case 'DELETE':
        return <div className="p-2 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-full"><Trash2 className="w-4 h-4" /></div>;
      case 'ALERT_STOCK':
        return <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full"><AlertCircle className="w-4 h-4" /></div>;
      case 'ALERT_VACCINE':
        return <div className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-full"><AlertCircle className="w-4 h-4" /></div>;
      default:
        return <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full"><AlertCircle className="w-4 h-4" /></div>;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return `Kemarin`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute top-2 right-2.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 border-2 border-white dark:border-slate-950"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-emerald-900/10 border border-slate-100 dark:border-slate-800 z-50 overflow-hidden transform opacity-100 scale-100 transition-all">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Notifikasi</h3>
            <span className="text-xs text-slate-500 font-medium">{visibleNotifications.length} terbaru</span>
          </div>

          <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
            {visibleNotifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                Belum ada notifikasi baru
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleNotifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 items-start">
                    {getIcon(notif.action)}
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                        {notif.description}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        {formatTime(notif.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            {(userRole === 'admin' || userRole === 'owner') ? (
              <Link
                href="/settings/audit-logs"
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
              >
                Lihat Semua Aktivitas
              </Link>
            ) : (
              <button
                onClick={handleClearAll}
                disabled={visibleNotifications.length === 0}
                className="block w-full text-center py-2 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hapus Semua
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
