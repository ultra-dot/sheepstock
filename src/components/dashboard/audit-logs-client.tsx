'use client'

import { useState, useTransition } from "react"
import { ShieldAlert, ArrowLeft, Clock, User as UserIcon, RotateCcw, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { restoreCheckpoint } from "@/app/actions/audit"

export function AuditLogsClient({ logs }: { logs: any[] }) {
    const [isPending, startTransition] = useTransition()
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, logId: string, message: string } | null>(null)
    const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean, title: string, message: string } | null>(null)
    const [successDialog, setSuccessDialog] = useState<{ isOpen: boolean, title: string, message: string } | null>(null)

    const handleRestore = (logId: string) => {
        setConfirmDialog(null)
        startTransition(async () => {
            try {
                await restoreCheckpoint(logId)
                setSuccessDialog({ 
                    isOpen: true, 
                    title: "Restore Berhasil", 
                    message: "Data telah sukses dikembalikan ke state sebelumnya." 
                })
            } catch (error: any) {
                setErrorDialog({ 
                    isOpen: true, 
                    title: "Gagal Melakukan Restore", 
                    message: error.message || "Terjadi kesalahan sistem." 
                })
            }
        })
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger />
                    <Link href="/settings" className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-3 ml-0 min-w-0">
                        <ShieldAlert className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">Log Aktivitas Sistem</h2>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Audit Trail & Checkpoint</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            Merekam 100 aktivitas terakhir. Fitur <span className="font-bold text-amber-500">Restore</span> memungkinkan Anda untuk membatalkan perubahan data.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Waktu</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Pengguna</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Modul</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Deskripsi</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Checkpoint</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {!logs || logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-slate-500 font-medium">
                                                Belum ada riwayat aktivitas.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => {
                                            let actionColor = "bg-slate-100 text-slate-700";
                                            if (log.action === 'CREATE') actionColor = "bg-emerald-100 text-emerald-700";
                                            if (log.action === 'UPDATE') actionColor = "bg-blue-100 text-blue-700";
                                            if (log.action === 'DELETE') actionColor = "bg-rose-100 text-rose-700";

                                            const isRestorable = (log.old_data || log.action === 'CREATE') && log.entity_type !== 'harvest' && log.entity_type !== 'cages_move';

                                            return (
                                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                            <Clock className="w-4 h-4" />
                                                            {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                                                            <UserIcon className="w-4 h-4 text-slate-400" />
                                                            {log.profiles?.name || 'User Terhapus'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${actionColor}`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-xs font-bold text-slate-500 uppercase">
                                                            {log.entity_type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                                            {log.description}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {isRestorable && (
                                                            <button
                                                                onClick={() => setConfirmDialog({
                                                                    isOpen: true,
                                                                    logId: log.id,
                                                                    message: `Apakah Anda yakin ingin melakukan RESTORE untuk aksi ini?\n\n"${log.description}"\n\nAksi ini akan dicatat di log.`
                                                                })}
                                                                disabled={isPending}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 dark:text-amber-500 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                                                title="Kembalikan perubahan ini"
                                                            >
                                                                <RotateCcw className="w-3.5 h-3.5" />
                                                                Restore
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Dialog */}
            {confirmDialog?.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="p-6">
                            <div className="flex justify-center mb-4">
                                <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 p-3 rounded-full">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">Konfirmasi Restore</h3>
                            <p className="text-sm text-slate-500 text-center whitespace-pre-line">{confirmDialog.message}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                            <button onClick={() => setConfirmDialog(null)} className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                Batal
                            </button>
                            <button onClick={() => handleRestore(confirmDialog.logId)} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-md transition-colors">
                                {isPending ? 'Memproses...' : 'Restore Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error/Success Dialogs from here are same as standard UI */}
            {errorDialog?.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="p-6 text-center">
                            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">{errorDialog.title}</h3>
                            <p className="text-sm text-slate-500 whitespace-pre-line">{errorDialog.message}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                            <button onClick={() => setErrorDialog(null)} className="w-full px-4 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm">Mengerti</button>
                        </div>
                    </div>
                </div>
            )}

            {successDialog?.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="p-6 text-center">
                            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">{successDialog.title}</h3>
                            <p className="text-sm text-slate-500 whitespace-pre-line">{successDialog.message}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
                            <button onClick={() => setSuccessDialog(null)} className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
