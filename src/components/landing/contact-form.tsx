"use client";

import { useActionState, useEffect, useState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const initialState = {
    error: null as string | null,
    success: false,
};

export function ContactForm() {
    const [state, formAction, isPending] = useActionState(submitContactForm, initialState);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (state.success) {
            setIsSuccess(true);
        }
    }, [state.success]);

    if (isSuccess) {
        return (
            <div className="bg-emerald-50 rounded-2xl p-8 py-16 border border-emerald-100 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Pesan Berhasil Terkirim!</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">
                    Terima kasih telah menghubungi kami. Tim SheepStock akan segera membalas pesan Anda dalam kurun waktu 24 jam.
                </p>
                <button 
                    onClick={() => setIsSuccess(false)}
                    className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition"
                >
                    Kirim Pesan Lain
                </button>
            </div>
        );
    }

    return (
        <form action={formAction} className="space-y-4">
            {state?.error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{state.error}</p>
                </div>
            )}

            {/* Honeypot Field - Hidden from humans */}
            <div className="hidden" aria-hidden="true">
                <input type="text" name="bot_field" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="firstName" className="block text-xs font-semibold mb-1.5 text-slate-700">Nama Awal</label>
                    <input type="text" id="firstName" name="firstName" required placeholder="Naufal" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
                </div>
                <div>
                    <label htmlFor="lastName" className="block text-xs font-semibold mb-1.5 text-slate-700">Nama Akhir</label>
                    <input type="text" id="lastName" name="lastName" placeholder="Riyadi" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
                </div>
            </div>
            <div>
                <label htmlFor="email" className="block text-xs font-semibold mb-1.5 text-slate-700">Alamat Email</label>
                <input type="email" id="email" name="email" required placeholder="naufal@gmail.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
            </div>
            <div>
                <label htmlFor="livestockCount" className="block text-xs font-semibold mb-1.5 text-slate-700">Jumlah Ternak</label>
                <select id="livestockCount" name="livestockCount" required defaultValue="" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition appearance-none">
                    <option value="" disabled>Pilih Skala Peternakan</option>
                    <option value="Kurang dari 100">Kurang dari 100</option>
                    <option value="100 - 500">100 - 500</option>
                    <option value="500+">500+</option>
                </select>
            </div>
            <div>
                <label htmlFor="message" className="block text-xs font-semibold mb-1.5 text-slate-700">Pesan</label>
                <textarea id="message" name="message" required maxLength={500} rows={4} placeholder="Ceritakan tentang operasional Anda..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none"></textarea>
                <p className="text-[10px] text-slate-400 mt-1 text-right">Maks. 500 karakter</p>
            </div>
            <button 
                type="submit" 
                disabled={isPending}
                className="w-full py-3 bg-[#054431] text-white rounded-xl font-bold text-sm hover:bg-[#065a40] transition shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
            >
                {isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                ) : (
                    "Kirim Pesan"
                )}
            </button>
        </form>
    );
}
