import React, { useState, useEffect, useMemo } from "react";
import { Wheat, X, AlertCircle } from "lucide-react";
import { feedMultipleCages } from "@/app/actions/cages";

export type FeedItem = {
    id: string
    name: string
    current_stock: number
    unit: string
}

export type CageWithUIState = {
    id: string
    name: string
    current_occupancy: number
    ui: { fedToday: boolean }
}

export function BulkFeedModal({
    isOpen,
    onClose,
    feedItems,
    cages,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    feedItems: FeedItem[];
    cages: CageWithUIState[];
    onSuccess: (msg: string) => void;
}) {
    const [selectedFeedId, setSelectedFeedId] = useState("");
    const [ratioStr, setRatioStr] = useState("1"); // Default 1 Kg / ekor
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // State for per-cage inputs and checkboxes
    const [cageDistributions, setCageDistributions] = useState<Record<string, { selected: boolean, amountStr: string }>>({});

    useEffect(() => {
        if (isOpen) {
            // Reset to default on open
            setSelectedFeedId("");
            setRatioStr("1");
            setErrorMsg("");
            
            // Initialize cage distributions
            const initialDists: Record<string, { selected: boolean, amountStr: string }> = {};
            cages.forEach(cage => {
                if (cage.current_occupancy > 0) {
                    initialDists[cage.id] = {
                        selected: !cage.ui.fedToday, // Default checked if NOT fed today
                        amountStr: (cage.current_occupancy * 1).toString() // Default amount based on ratio=1
                    };
                }
            });
            setCageDistributions(initialDists);
        }
    }, [isOpen, cages]);

    // Update amounts when ratio changes
    const handleRatioChange = (val: string) => {
        setRatioStr(val);
        const ratio = parseFloat(val);
        if (!isNaN(ratio) && ratio >= 0) {
            setCageDistributions(prev => {
                const next = { ...prev };
                cages.forEach(cage => {
                    if (next[cage.id]) {
                        next[cage.id].amountStr = (cage.current_occupancy * ratio).toString();
                    }
                });
                return next;
            });
        }
    };

    const toggleCage = (cageId: string) => {
        setCageDistributions(prev => ({
            ...prev,
            [cageId]: { ...prev[cageId], selected: !prev[cageId].selected }
        }));
    };

    const updateAmount = (cageId: string, val: string) => {
        setCageDistributions(prev => ({
            ...prev,
            [cageId]: { ...prev[cageId], amountStr: val }
        }));
    };

    const activeCages = cages.filter(c => c.current_occupancy > 0);
    const totalAmount = useMemo(() => {
        let sum = 0;
        Object.values(cageDistributions).forEach(dist => {
            if (dist.selected) {
                const amt = parseFloat(dist.amountStr);
                if (!isNaN(amt)) sum += amt;
            }
        });
        return sum;
    }, [cageDistributions]);

    if (!isOpen) return null;

    const handleFeed = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!selectedFeedId) {
            setErrorMsg("Pilih jenis pakan terlebih dahulu.");
            return;
        }

        const distributions = Object.entries(cageDistributions)
            .filter(([_, dist]) => dist.selected)
            .map(([cage_id, dist]) => {
                const amount = parseFloat(dist.amountStr);
                return { cage_id, amount };
            })
            .filter(d => !isNaN(d.amount) && d.amount > 0);

        if (distributions.length === 0) {
            setErrorMsg("Pilih setidaknya satu kandang dan tentukan jumlah pakan yang valid.");
            return;
        }

        try {
            setIsSubmitting(true);
            await feedMultipleCages(selectedFeedId, distributions);
            onSuccess(`Berhasil mendistribusikan total ${totalAmount.toFixed(2)} Kg pakan ke ${distributions.length} kandang.`);
            onClose();
        } catch (error: any) {
            setErrorMsg(error.message || "Gagal mendistribusikan pakan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                            <Wheat className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Distribusi Pakan Massal</h2>
                            <p className="text-sm text-slate-500">Sesuaikan porsi untuk tiap kandang</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleFeed} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {errorMsg && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm rounded-xl flex items-center gap-2 border border-rose-100 dark:border-rose-900/50">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>{errorMsg}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Jenis Pakan <span className="text-rose-500">*</span></label>
                            <select
                                value={selectedFeedId}
                                onChange={(e) => setSelectedFeedId(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200"
                            >
                                <option value="">Pilih pakan...</option>
                                {feedItems.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} (Sisa: {item.current_stock} {item.unit})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Rasio Pakan per Ekor (Kg) <span className="text-rose-500">*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={ratioStr}
                                onChange={(e) => handleRatioChange(e.target.value)}
                                placeholder="Contoh: 1"
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-200"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Daftar Kandang Aktif</label>
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                                Total: {totalAmount.toFixed(2)} Kg
                            </span>
                        </div>
                        
                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                            <div className="max-h-60 overflow-y-auto">
                                {/* Mobile Card View */}
                                <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
                                    {activeCages.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-slate-500 text-sm">Tidak ada kandang yang aktif</div>
                                    ) : activeCages.map(cage => {
                                        const dist = cageDistributions[cage.id];
                                        if (!dist) return null;
                                        return (
                                            <div key={cage.id} className={`p-3.5 space-y-2.5 transition-colors ${dist.selected ? 'bg-white dark:bg-slate-900' : 'opacity-50'}`}>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={dist.selected}
                                                        onChange={() => toggleCage(cage.id)}
                                                        className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 cursor-pointer shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">{cage.name}</div>
                                                        {cage.ui.fedToday && (
                                                            <div className="text-[10px] text-emerald-500 font-medium">Sudah diberi pakan hari ini</div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pl-7">
                                                    <span className="text-xs text-slate-500 font-medium">{cage.current_occupancy} ekor</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] text-slate-400 font-bold">Porsi:</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={dist.amountStr}
                                                            onChange={(e) => updateAmount(cage.id, e.target.value)}
                                                            disabled={!dist.selected}
                                                            className="w-20 px-2 py-1 text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                                                        />
                                                        <span className="text-[10px] text-slate-400 font-medium">Kg</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Desktop Table View */}
                                <table className="hidden md:table w-full text-sm text-left">
                                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10">
                                        <tr>
                                            <th className="px-4 py-3 w-10 text-center">
                                                {/* Optional: Check all checkbox */}
                                            </th>
                                            <th className="px-4 py-3">Nama Kandang</th>
                                            <th className="px-4 py-3 text-center">Populasi</th>
                                            <th className="px-4 py-3 text-right">Porsi (Kg)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {activeCages.map(cage => {
                                            const dist = cageDistributions[cage.id];
                                            if (!dist) return null;
                                            
                                            return (
                                                <tr key={cage.id} className={dist.selected ? "bg-white dark:bg-slate-900" : "opacity-50"}>
                                                    <td className="px-4 py-3 text-center">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={dist.selected}
                                                            onChange={() => toggleCage(cage.id)}
                                                            className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-slate-700 dark:text-slate-200">{cage.name}</div>
                                                        {cage.ui.fedToday && (
                                                            <div className="text-[10px] text-emerald-500 font-medium">Sudah diberi pakan hari ini</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-medium">
                                                        {cage.current_occupancy}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <input 
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={dist.amountStr}
                                                            onChange={(e) => updateAmount(cage.id, e.target.value)}
                                                            disabled={!dist.selected}
                                                            className="w-20 px-2 py-1 text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {activeCages.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                                    Tidak ada kandang yang aktif
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 shrink-0 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={handleFeed}
                        disabled={isSubmitting || activeCages.length === 0 || totalAmount <= 0}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Memproses...
                            </>
                        ) : (
                            `Distribusikan ${totalAmount.toFixed(2)} Kg`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
