"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";

type CageData = {
  cage: string;
  occupancy: number;
  males: number;
  females: number;
};

export function PopulationDropdown({ data }: { data: CageData[] }) {
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
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
        title="Lihat Detail Populasi"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Detail Populasi</h4>
            <p className="text-xs text-slate-500">Berdasarkan jenis kelamin</p>
          </div>
          <div className="max-h-64 overflow-y-auto p-2 space-y-1">
            {data.filter(d => d.occupancy > 0).length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">Tidak ada data ternak.</div>
            ) : (
              data.filter(d => d.occupancy > 0).map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.cage}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.occupancy} Ekor
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center justify-between px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <span className="text-[10px] font-semibold">Jantan</span>
                      </div>
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300">{item.males}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-between px-2 py-1 bg-pink-50 dark:bg-pink-900/20 rounded-md">
                      <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
                        <span className="text-[10px] font-semibold">Betina</span>
                      </div>
                      <span className="text-xs font-bold text-pink-700 dark:text-pink-300">{item.females}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
