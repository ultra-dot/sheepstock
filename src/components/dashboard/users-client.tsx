'use client'

import { useState, useTransition } from "react"
import { Shield, ShieldAlert, UserX, UserCheck, MoreVertical, X, Check } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserDropdown } from "@/components/dashboard/user-dropdown"
import { updateUserRole, UserProfile } from "@/app/actions/users"

export function UsersClient({
    initialProfiles,
    currentUserId,
    userName,
    avatarUrl
}: {
    initialProfiles: UserProfile[]
    currentUserId: string
    userName: string
    avatarUrl: string | null
}) {
    const [isPending, startTransition] = useTransition()
    const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean, title: string, message: string } | null>(null)
    const [successDialog, setSuccessDialog] = useState<{ isOpen: boolean, title: string, message: string } | null>(null)
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null)

    const handleRoleChange = (userId: string, currentRole: string, newRole: string, name: string) => {
        let actionName = newRole === 'admin' ? 'Promote ke Admin' : newRole === 'inactive' ? 'Nonaktifkan Akun' : 'Jadikan Staff'
        
        setConfirmDialog({
            isOpen: true,
            title: `Konfirmasi ${actionName}`,
            message: `Apakah Anda yakin ingin mengubah hak akses "${name}" menjadi "${newRole.toUpperCase()}"?\n\n⚠️ Aksi ini akan dicatat di Audit Log.`,
            onConfirm: () => {
                setConfirmDialog(null)
                startTransition(async () => {
                    try {
                        await updateUserRole(userId, newRole)
                        setSuccessDialog({ isOpen: true, title: "Berhasil", message: `Role ${name} berhasil diubah menjadi ${newRole}.` })
                    } catch (error: any) {
                        setErrorDialog({ isOpen: true, title: "Gagal Mengubah Role", message: error.message || "Terjadi kesalahan sistem." })
                    }
                })
            }
        })
    }

    const roleBadge = (role: string) => {
        if (role === 'admin') return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider">Admin</span>
        if (role === 'inactive') return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider">Nonaktif</span>
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">Staff</span>
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-2 min-w-0">
                        <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">Manajemen Pegawai</h2>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <UserDropdown userName={userName} avatarUrl={avatarUrl} showName={true} />
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Daftar Akun Terdaftar</h3>
                                <p className="text-sm text-slate-500">Kelola akses dan jabatan pegawai peternakan Anda.</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-4 rounded-tl-2xl">Nama Pegawai</th>
                                        <th className="px-6 py-4">Role Saat Ini</th>
                                        <th className="px-6 py-4">Status & Waktu</th>
                                        <th className="px-6 py-4 text-center rounded-tr-2xl">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {initialProfiles.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada pegawai terdaftar.</td>
                                        </tr>
                                    ) : (
                                        initialProfiles.map((user) => {
                                            const isOnline = user.last_sign_in_at && (new Date().getTime() - new Date(user.last_sign_in_at).getTime() < 1000 * 60 * 60 * 24); // within 24 hours
                                            return (
                                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                            {user.name}
                                                            {isOnline && <span className="flex w-2 h-2 rounded-full bg-emerald-500"></span>}
                                                        </div>
                                                        {user.phone && <div className="text-xs text-slate-500">{user.phone}</div>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {roleBadge(user.role)}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                                        <div>Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                        {user.last_sign_in_at ? (
                                                            <div className="mt-1 font-medium text-slate-400">Login: {new Date(user.last_sign_in_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                                        ) : (
                                                            <div className="mt-1 font-medium text-amber-500/80">Belum pernah login</div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.id === currentUserId ? (
                                                            <span className="text-xs text-slate-400 italic block text-center">Akun Anda</span>
                                                        ) : (
                                                        <div className="flex items-center justify-center gap-2">
                                                            {user.role !== 'admin' && (
                                                                <button
                                                                    onClick={() => handleRoleChange(user.id, user.role, 'admin', user.name)}
                                                                    disabled={isPending}
                                                                    className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-colors disabled:opacity-50"
                                                                    title="Promote ke Admin"
                                                                >
                                                                    <Shield className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            {user.role !== 'staff' && (
                                                                <button
                                                                    onClick={() => handleRoleChange(user.id, user.role, 'staff', user.name)}
                                                                    disabled={isPending}
                                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors disabled:opacity-50"
                                                                    title="Jadikan Staff"
                                                                >
                                                                    <UserCheck className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            {user.role !== 'inactive' && (
                                                                <button
                                                                    onClick={() => handleRoleChange(user.id, user.role, 'inactive', user.name)}
                                                                    disabled={isPending}
                                                                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors disabled:opacity-50"
                                                                    title="Nonaktifkan Akun"
                                                                >
                                                                    <UserX className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
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
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">{confirmDialog.title}</h3>
                            <p className="text-sm text-slate-500 text-center whitespace-pre-line">{confirmDialog.message}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                            <button onClick={() => setConfirmDialog(null)} className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                Batal
                            </button>
                            <button onClick={confirmDialog.onConfirm} className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm shadow-md transition-colors">
                                Lanjutkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Dialog */}
            {errorDialog?.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="p-6">
                            <div className="flex justify-center mb-4">
                                <div className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 p-3 rounded-full">
                                    <X className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">{errorDialog.title}</h3>
                            <p className="text-sm text-slate-500 text-center whitespace-pre-line leading-relaxed">{errorDialog.message}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-center">
                            <button onClick={() => setErrorDialog(null)} className="w-full px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors">
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Dialog */}
            {successDialog?.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="p-6">
                            <div className="flex justify-center mb-4">
                                <div className="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 p-3 rounded-full">
                                    <Check className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">{successDialog.title}</h3>
                            <p className="text-sm text-slate-500 text-center whitespace-pre-line leading-relaxed">{successDialog.message}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-center">
                            <button onClick={() => setSuccessDialog(null)} className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors shadow-md">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
