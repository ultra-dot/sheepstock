import React from 'react';
import QRCode from 'react-qr-code';

interface QrStickerGridProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    livestocks: any[];
    paperSize: 'a4' | 'f4' | 'letter';
}

export const QrStickerGrid: React.FC<QrStickerGridProps> = ({ livestocks, paperSize }) => {
    // Determine the max width based on paper size for the preview container
    const getPaperWidth = () => {
        switch (paperSize) {
            case 'f4': return '215.9mm';
            case 'letter': return '215.9mm';
            case 'a4':
            default:
                return '210mm';
        }
    };

    return (
        <div 
            className="bg-white mx-auto shadow-sm print:shadow-none print:m-0"
            style={{ 
                width: getPaperWidth(), 
                minHeight: '297mm', // Approximate height for 1 A4 page
                padding: '10mm',
            }}
        >
            {/* 
              CSS Grid setup for stickers. 
              3 columns is a standard layout for A4 label stickers.
            */}
            <div className="grid grid-cols-3 gap-2">
                {livestocks.map((animal, index) => {
                    // Generate the tracking URL that the QR code will represent
                    // Assuming the actual domain is sheepstock.cloud
                    const qrUrl = `https://sheepstock.cloud/livestock/${animal.qr_code}`;
                    
                    return (
                        <div 
                            key={animal.id || index}
                            className="border border-dashed border-slate-300 p-3 flex flex-col items-center justify-center bg-white print:break-inside-avoid"
                            style={{ 
                                height: '4.5cm', // Fixed height so the grid is perfectly even
                                pageBreakInside: 'avoid',
                                breakInside: 'avoid'
                            }}
                        >
                            {/* Brand Header */}
                            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <img src="/assets/image/logo-sheepstock-green.png" alt="Logo" className="w-3 h-3 object-contain" />
                                SheepStock
                            </div>

                            {/* The QR Code */}
                            <div className="bg-white p-1 rounded-md mb-2">
                                <QRCode 
                                    value={qrUrl}
                                    size={80}
                                    level="M" // Medium error correction is usually enough and cleaner
                                />
                            </div>

                            {/* Details */}
                            <div className="text-center w-full">
                                <p className="text-lg font-black text-slate-900 leading-tight tracking-wider mb-0.5">
                                    {animal.qr_code || 'N/A'}
                                </p>
                                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                                    {(animal.gender === 'male' || animal.gender === 'Jantan') ? 'Jantan' : 
                                     (animal.gender === 'female' || animal.gender === 'Betina') ? 'Betina' : animal.gender} 
                                    {animal.cages?.name ? ` • ${animal.cages.name}` : ''}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {livestocks.length === 0 && (
                <div className="flex items-center justify-center h-64 text-slate-400 italic">
                    Belum ada data ternak yang dipilih.
                </div>
            )}
        </div>
    );
};
