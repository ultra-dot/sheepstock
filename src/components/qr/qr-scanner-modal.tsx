import React, { useState } from 'react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { X, Camera, AlertCircle, RefreshCcw } from 'lucide-react';

interface QrScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (id: string) => void;
    title?: string;
    description?: string;
}

export function QrScannerModal({ 
    isOpen, 
    onClose, 
    onScanSuccess, 
    title = "Scan QR Code", 
    description = "Arahkan kamera ke QR Code pada ear-tag domba." 
}: QrScannerModalProps) {
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

    if (!isOpen) return null;

    const handleScan = (detectedCodes: IDetectedBarcode[]) => {
        if (detectedCodes.length > 0) {
            const result = detectedCodes[0].rawValue;
            // Parse the ID if it's a URL (e.g. https://sheepstock.cloud/livestock/DOM-1002)
            // Or just return the raw string if it's just the ID
            let parsedId = result;
            try {
                if (result.includes('http')) {
                    const url = new URL(result);
                    const parts = url.pathname.split('/');
                    parsedId = parts[parts.length - 1];
                }
            } catch (e) {
                // Ignore URL parsing errors and fallback to raw result
            }
            onScanSuccess(parsedId);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
                
                {/* Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Camera className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                            <p className="text-xs text-slate-500 font-medium">{description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setFacingMode(prev => prev === "environment" ? "user" : "environment")}
                            className="h-8 px-3 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors text-xs font-bold gap-1.5"
                            title="Tukar Kamera"
                        >
                            <RefreshCcw className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Flip</span>
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center text-slate-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Scanner Area */}
                <div className="relative bg-black aspect-square flex items-center justify-center overflow-hidden">
                    {errorMsg && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white p-6 text-center space-y-3">
                            <AlertCircle className="w-10 h-10 text-rose-500" />
                            <p className="text-sm font-medium">{errorMsg}</p>
                            <button 
                                onClick={() => setErrorMsg(null)}
                                className="px-4 py-2 mt-2 bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    )}

                    <Scanner
                        onScan={handleScan}
                        onError={(error) => {
                            // Don't show annoying console errors for standard scanning failures,
                            // only catch real permission/hardware errors.
                            const err = error as unknown as Error;
                            if (err?.name === 'NotAllowedError') {
                                setErrorMsg("Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.");
                            } else if (err?.name === 'NotFoundError') {
                                setErrorMsg("Kamera tidak ditemukan pada perangkat ini.");
                            }
                        }}
                        constraints={{
                            facingMode: facingMode
                        }}
                        styles={{
                            container: { width: '100%', height: '100%' }
                        }}
                    />
                    
                    {/* Overlay Frame Guide */}
                    <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none z-10 flex items-center justify-center">
                        <div className="w-full h-full border-2 border-emerald-500 rounded-2xl"></div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 text-center border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400">Pastikan pencahayaan cukup agar QR mudah dibaca.</p>
                </div>

            </div>
        </div>
    );
}
