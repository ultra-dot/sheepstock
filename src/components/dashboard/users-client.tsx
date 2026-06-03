'use client'

import { useState, useTransition } from "react"
import { Shield, ShieldAlert, UserX, UserCheck, X, XCircle, Check, Plus, Copy, Trash2, Mail, Phone, User, Key, CheckCircle2, AlertCircle } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { UserDropdown } from "@/components/dashboard/user-dropdown"
import { updateUserRole, deleteUserProfile, createStaffAccount, UserProfile } from "@/app/actions/users"
import { Input } from "@/components/ui/input"

export function UsersClient({
    initialProfiles,
    currentUserId,
    userName,
    avatarUrl,
    referralCode
}: {
    initialProfiles: UserProfile[]
    currentUserId: string
    userName: string
    avatarUrl: string | null
    referralCode: string | null
}) {
    const [isPending, startTransition] = useTransition()
    const [copied, setCopied] = useState(false)

    // Add Staff Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [newStaffForm, setNewStaffForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    })
    const [addError, setAddError] = useState<string | null>(null)

    // Dialogs States
    const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean, title: string, message: string } | null>(null)
    const [successDialog, setSuccessDialog] = useState<{ isOpen: boolean, title: string, message: string } | null>(null)
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null)

    const handleCopy = () => {
        if (referralCode) {
            navigator.clipboard.writeText(referralCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleRoleChange = (userId: string, currentRole: string, newRole: string, name: string) => {
        let actionName = newRole === 'admin'
            ? 'Promote ke Admin'
            : newRole === 'staff'
                ? 'Jadikan Staff'
                : newRole === 'inactive'
                    ? 'Nonaktifkan Akun'
                    : 'Setujui Pendaftaran'

        setConfirmDialog({
            isOpen: true,
            title: `Konfirmasi ${actionName}`,
            message: `Apakah Anda yakin ingin mengubah status "${name}" menjadi "${newRole.toUpperCase()}"?\n\n⚠️ Aksi ini akan dicatat di Audit Log.`,
            onConfirm: () => {
                setConfirmDialog(null)
                startTransition(async () => {
                    try {
                        await updateUserRole(userId, newRole)
                        setSuccessDialog({ isOpen: true, title: "Berhasil", message: `Status ${name} berhasil diubah menjadi ${newRole.toUpperCase()}.` })
                    } catch (error: any) {
                        setErrorDialog({ isOpen: true, title: "Gagal Mengubah Status", message: error.message || "Terjadi kesalahan sistem." })
                    }
                })
            }
        })
    }

    const handleDeleteStaff = (userId: string, name: string) => {
        setConfirmDialog({
            isOpen: true,
            title: `Hapus Pegawai`,
            message: `Apakah Anda yakin ingin menghapus "${name}" dari peternakan Anda?\n\n⚠️ Aksi ini akan menghapus akses pegawai dan akan dicatat di Audit Log.`,
            onConfirm: () => {
                setConfirmDialog(null)
                startTransition(async () => {
                    try {
                        await deleteUserProfile(userId)
                        setSuccessDialog({ isOpen: true, title: "Berhasil Dihapus", message: `Pegawai ${name} berhasil dihapus dari peternakan.` })
                    } catch (error: any) {
                        setErrorDialog({ isOpen: true, title: "Gagal Menghapus", message: error.message || "Terjadi kesalahan sistem." })
                    }
                })
            }
        })
    }

    const handleCreateStaff = (e: React.FormEvent) => {
        e.preventDefault()
        setAddError(null)

        if (!newStaffForm.name || !newStaffForm.email || !newStaffForm.password) {
            setAddError("Nama, Email, dan Kata Sandi wajib diisi.")
            return
        }

        startTransition(async () => {
            try {
                await createStaffAccount(
                    newStaffForm.name,
                    newStaffForm.email,
                    newStaffForm.phone || null,
                    newStaffForm.password
                )
                setIsAddModalOpen(false)
                setNewStaffForm({ name: '', email: '', phone: '', password: '' })
                setSuccessDialog({
                    isOpen: true,
                    title: "Staf Berhasil Dibuat",
                    message: `Akun staf baru untuk "${newStaffForm.name}" berhasil didaftarkan secara langsung dan siap digunakan.`
                })
            } catch (error: any) {
                setAddError(error.message || "Gagal membuat akun staf.")
            }
        })
    }

    const roleBadge = (role: string) => {
        if (role === 'owner') return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-full text-xs font-bold uppercase tracking-wider">Owner</span>
        if (role === 'admin') return <span className="px-2.5 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider">Admin</span>
        if (role === 'inactive') return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider">Nonaktif</span>
        if (role === 'pending_approval') return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider">Menunggu Persetujuan</span>
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">Staff</span>
    }

    const pendingProfiles = initialProfiles.filter(p => p.role === 'pending_approval')
    const activeProfiles = initialProfiles.filter(p => p.role !== 'pending_approval')

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
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Referral Panel (Only for Owners) */}
                    {referralCode && (
                        <div className="bg-gradient-to-r from-emerald-800 to-[#003B26] text-white rounded-3xl p-6 shadow-xl border border-emerald-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="relative z-10 space-y-1 max-w-md">
                                <h3 className="text-lg font-bold text-[#BDF525]">Mendaftarkan Pegawai Baru</h3>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    Bagikan Kode Referral di bawah kepada calon pegawai Anda saat melakukan registrasi di aplikasi. Pendaftaran mereka akan muncul dalam daftar persetujuan sebelum dapat mengakses dashboard.
                                </p>
                            </div>
                            <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 w-full sm:w-auto justify-between md:justify-start">
                                <div className="space-y-0.5 px-2">
                                    <p className="text-[10px] uppercase font-bold text-[#BDF525] tracking-widest leading-none">KODE REFERRAL</p>
                                    <p className="text-lg font-extrabold tracking-wider font-mono">{referralCode}</p>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                                >
                                    {copied ? <Check className="w-5 h-5 text-[#BDF525]" /> : <Copy className="w-5 h-5" />}
                                    <span className="text-xs font-bold">{copied ? "Copied!" : "Copy"}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Header bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">Karyawan & Staff</h3>
                            <p className="text-sm text-slate-500">Kelola pendaftaran pegawai dan kontrol hak akses peternakan.</p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-5 py-3 bg-[#003B26] hover:bg-[#002F1D] text-white rounded-2xl flex items-center gap-2 font-bold text-sm shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Pegawai Langsung
                        </button>
                    </div>

                    {/* 1. Pending Approvals Section */}
                    {pendingProfiles.length > 0 && (
                        <div className="bg-amber-500/5 dark:bg-amber-500/10 rounded-3xl border border-amber-500/20 overflow-hidden shadow-sm">
                            <div className="px-4 sm:px-6 py-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse shrink-0"></div>
                                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-400">Persetujuan Pendaftaran Staff ({pendingProfiles.length})</h4>
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Nama Pegawai</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Tanggal Daftar</th>
                                            <th className="px-6 py-4 text-center">Persetujuan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                        {pendingProfiles.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800 dark:text-slate-200">{user.name}</div>
                                                    {user.phone && <div className="text-xs text-slate-500">{user.phone}</div>}
                                                </td>
                                                <td className="px-6 py-4">{roleBadge(user.role)}</td>
                                                <td className="px-6 py-4 text-slate-500 text-xs">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button onClick={() => handleRoleChange(user.id, user.role, 'staff', user.name)} disabled={isPending} className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm disabled:opacity-50">
                                                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                            Setujui
                                                        </button>
                                                        <button onClick={() => handleDeleteStaff(user.id, user.name)} disabled={isPending} className="px-3.5 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/30 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50">
                                                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                                            Tolak
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-amber-500/10">
                                {pendingProfiles.map((user) => (
                                    <div key={user.id} className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{user.name}</div>
                                                {user.phone && <div className="text-xs text-slate-500">{user.phone}</div>}
                                                <div className="text-xs text-slate-400 mt-1">{new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                            </div>
                                            {roleBadge(user.role)}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRoleChange(user.id, user.role, 'staff', user.name)} disabled={isPending} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm disabled:opacity-50">
                                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                Setujui
                                            </button>
                                            <button onClick={() => handleDeleteStaff(user.id, user.name)} disabled={isPending} className="flex-1 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/30 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50">
                                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                                Tolak
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 2. Active Employee List */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-4 sm:px-6 py-5 border-b border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Daftar Akun Aktif</h3>
                            <p className="text-sm text-slate-500">Anggota peternakan terdaftar yang memiliki hak akses.</p>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Nama Pegawai</th>
                                        <th className="px-6 py-4">Role / Jabatan</th>
                                        <th className="px-6 py-4">Status & Waktu</th>
                                        <th className="px-6 py-4 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {activeProfiles.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada pegawai terdaftar.</td>
                                        </tr>
                                    ) : (
                                        activeProfiles.map((user) => {
                                            const isOnline = user.last_sign_in_at && (new Date().getTime() - new Date(user.last_sign_in_at).getTime() < 1000 * 60 * 60 * 24);
                                            return (
                                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                            {user.name}
                                                            {isOnline && <span className="flex w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>}
                                                        </div>
                                                        {user.phone && <div className="text-xs text-slate-500">{user.phone}</div>}
                                                    </td>
                                                    <td className="px-6 py-4">{roleBadge(user.role)}</td>
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
                                                            <div className="flex items-center justify-center gap-1">
                                                                {user.role !== 'admin' && (
                                                                    <button onClick={() => handleRoleChange(user.id, user.role, 'admin', user.name)} disabled={isPending} className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-colors disabled:opacity-50 cursor-pointer" title="Jadikan Admin">
                                                                        <Shield className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                {user.role !== 'staff' && (
                                                                    <button onClick={() => handleRoleChange(user.id, user.role, 'staff', user.name)} disabled={isPending} className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors disabled:opacity-50 cursor-pointer" title="Jadikan Staff">
                                                                        <UserCheck className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                {user.role !== 'inactive' && (
                                                                    <button onClick={() => handleRoleChange(user.id, user.role, 'inactive', user.name)} disabled={isPending} className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors disabled:opacity-50 cursor-pointer" title="Nonaktifkan Sementara">
                                                                        <UserX className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                <button onClick={() => handleDeleteStaff(user.id, user.name)} disabled={isPending} className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors disabled:opacity-50 cursor-pointer" title="Hapus Pegawai">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
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

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
                            {activeProfiles.length === 0 ? (
                                <div className="px-4 py-8 text-center text-slate-500 text-sm">Belum ada pegawai terdaftar.</div>
                            ) : (
                                activeProfiles.map((user) => {
                                    const isOnline = user.last_sign_in_at && (new Date().getTime() - new Date(user.last_sign_in_at).getTime() < 1000 * 60 * 60 * 24);
                                    return (
                                        <div key={user.id} className="p-4 space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2">
                                                        <span className="truncate">{user.name}</span>
                                                        {isOnline && <span className="flex w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>}
                                                    </div>
                                                    {user.phone && <div className="text-xs text-slate-500 mt-0.5">{user.phone}</div>}
                                                </div>
                                                {roleBadge(user.role)}
                                            </div>
                                            <div className="text-xs text-slate-400 space-y-0.5">
                                                <div>Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                {user.last_sign_in_at ? (
                                                    <div>Login: {new Date(user.last_sign_in_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                                ) : (
                                                    <div className="text-amber-500/80">Belum pernah login</div>
                                                )}
                                            </div>
                                            {user.id === currentUserId ? (
                                                <div className="text-xs text-slate-400 italic">Akun Anda</div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {user.role !== 'admin' && (
                                                        <button onClick={() => handleRoleChange(user.id, user.role, 'admin', user.name)} disabled={isPending} className="px-3 py-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-xs font-semibold flex items-center gap-1">
                                                            <Shield className="w-3.5 h-3.5 shrink-0" /> Admin
                                                        </button>
                                                    )}
                                                    {user.role !== 'staff' && (
                                                        <button onClick={() => handleRoleChange(user.id, user.role, 'staff', user.name)} disabled={isPending} className="px-3 py-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-xs font-semibold flex items-center gap-1">
                                                            <UserCheck className="w-3.5 h-3.5 shrink-0" /> Staff
                                                        </button>
                                                    )}
                                                    {user.role !== 'inactive' && (
                                                        <button onClick={() => handleRoleChange(user.id, user.role, 'inactive', user.name)} disabled={isPending} className="px-3 py-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-xs font-semibold flex items-center gap-1">
                                                            <UserX className="w-3.5 h-3.5 shrink-0" /> Nonaktif
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDeleteStaff(user.id, user.name)} disabled={isPending} className="px-3 py-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-xs font-semibold flex items-center gap-1">
                                                        <Trash2 className="w-3.5 h-3.5 shrink-0" /> Hapus
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Staff Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Tambah Pegawai Baru</h3>
                                <p className="text-xs text-slate-500">Buat akun staf secara instan.</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateStaff} className="flex flex-col overflow-hidden">
                            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
                                {addError && (
                                    <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-xl flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {addError}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label htmlFor="staffName" className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide ml-1">
                                        Nama Lengkap*
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            id="staffName"
                                            value={newStaffForm.name}
                                            onChange={e => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                                            type="text"
                                            placeholder="Nama Lengkap Staf"
                                            required
                                            className="h-[44px] bg-[#EBEFEF] pl-10 pr-4 border-0 rounded-xl text-sm text-black placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#024431]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="staffEmail" className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide ml-1">
                                        Email*
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            id="staffEmail"
                                            value={newStaffForm.email}
                                            onChange={e => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                                            type="email"
                                            placeholder="staf@domain.com"
                                            required
                                            className="h-[44px] bg-[#EBEFEF] pl-10 pr-4 border-0 rounded-xl text-sm text-black placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#024431]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="staffPhone" className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide ml-1">
                                        Nomor Telepon (Opsional)
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            id="staffPhone"
                                            value={newStaffForm.phone}
                                            onChange={e => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                                            type="tel"
                                            placeholder="0812XXXXXXXX"
                                            className="h-[44px] bg-[#EBEFEF] pl-10 pr-4 border-0 rounded-xl text-sm text-black placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#024431]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label htmlFor="staffPass" className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide ml-1">
                                        Kata Sandi Default*
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            id="staffPass"
                                            value={newStaffForm.password}
                                            onChange={e => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                                            type="text"
                                            placeholder="Min. 6 Karakter"
                                            required
                                            className="h-[44px] bg-[#EBEFEF] pl-10 pr-4 border-0 rounded-xl text-sm text-black placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[#024431]"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                                    Batal
                                </button>
                                <button type="submit" disabled={isPending} className="flex-1 px-4 py-2.5 bg-[#003B26] hover:bg-[#002F1D] text-white rounded-xl font-bold text-sm shadow-md transition-colors disabled:opacity-50 cursor-pointer">
                                    {isPending ? "Menyimpan..." : "Daftarkan Staff"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog?.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full sm:max-w-sm overflow-hidden flex flex-col">
                        <div className="p-6">
                            <div className="flex justify-center mb-4">
                                <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 p-3 rounded-full">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">{confirmDialog.title}</h3>
                            <p className="text-sm text-slate-500 text-center whitespace-pre-line leading-relaxed">{confirmDialog.message}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
                            <button onClick={() => setConfirmDialog(null)} className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                                Batal
                            </button>
                            <button onClick={confirmDialog.onConfirm} className="flex-1 px-4 py-2.5 bg-[#003B26] hover:bg-[#002F1D] text-white rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer">
                                Lanjutkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Dialog */}
            {errorDialog?.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full sm:max-w-sm overflow-hidden flex flex-col">
                        <div className="p-6">
                            <div className="flex justify-center mb-4">
                                <div className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 p-3 rounded-full">
                                    <XCircle className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100">{errorDialog.title}</h3>
                            <p className="text-sm text-slate-500 text-center whitespace-pre-line leading-relaxed">{errorDialog.message}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-center">
                            <button onClick={() => setErrorDialog(null)} className="w-full px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors cursor-pointer">
                                Mengerti
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Dialog */}
            {successDialog?.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full sm:max-w-sm overflow-hidden flex flex-col">
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
                            <button onClick={() => setSuccessDialog(null)} className="w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm transition-colors shadow-md cursor-pointer">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
