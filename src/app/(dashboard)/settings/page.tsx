"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Settings, User, Bell, LogOut, PenSquare } from "lucide-react"
import { useState, useEffect } from "react"
import { logout } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
    const [stockNotif, setStockNotif] = useState(true);
    const [vaccineNotif, setVaccineNotif] = useState(true);

    useEffect(() => {
        setStockNotif(localStorage.getItem('setting_stock_notif') !== 'false');
        setVaccineNotif(localStorage.getItem('setting_vaccine_notif') !== 'false');
    }, []);

    const toggleStockNotif = () => {
        const newVal = !stockNotif;
        setStockNotif(newVal);
        localStorage.setItem('setting_stock_notif', String(newVal));
    };

    const toggleVaccineNotif = () => {
        const newVal = !vaccineNotif;
        setVaccineNotif(newVal);
        localStorage.setItem('setting_vaccine_notif', String(newVal));
    };

    const [userEmail, setUserEmail] = useState<string | null>("Memuat...");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("Memuat...");
    const [userRole, setUserRole] = useState<string>("Memuat...");
    const [userId, setUserId] = useState<string | null>(null);

    // Edit state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [isUploading, setIsUploading] = useState(false);

    // Dialog states
    const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean, title: string, message: string } | null>(null);
    const [successDialog, setSuccessDialog] = useState<{ isOpen: boolean, title: string, message: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                setUserEmail(user.email ?? "Email tidak tersedia");
                setAvatarUrl(user.user_metadata?.avatar_url || null);

                // Fetch profile data
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

                let displayName = "Tanpa Nama";
                if (profile?.name && profile.name !== "New Staff") {
                    displayName = profile.name;
                } else if (user.user_metadata?.full_name) {
                    displayName = user.user_metadata.full_name;
                }

                setUserName(displayName);
                setEditName(displayName);

                if (profile) {
                    setUserRole(profile.role === 'owner' ? 'Owner Peternakan' : profile.role === 'admin' ? 'Administrator' : 'Staf');
                }
            } else {
                setUserEmail("Pengguna tidak ditemukan");
                setUserName("-");
                setUserRole("-");
            }
        };
        fetchUser();
    }, []);

    const handleSaveProfile = async () => {
        if (!userId) return;
        try {
            setIsSavingProfile(true);
            const supabase = createClient();

            // 1. Update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ name: editName })
                .eq('id', userId);

            if (profileError) throw profileError;

            // 2. Update auth metadata to keep it in sync
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: editName }
            });

            if (authError) throw authError;

            setUserName(editName);
            setIsEditingProfile(false);
            setSuccessDialog({ isOpen: true, title: "Berhasil", message: "Profil berhasil disimpan!" });
        } catch (error) {
            console.error('Error saving profile:', error);
            setErrorDialog({ isOpen: true, title: "Gagal Menyimpan", message: 'Gagal menyimpan profil.' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

            if (!userId) throw new Error("Not authenticated");

            // Upload new file
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update user metadata
            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            setSuccessDialog({ isOpen: true, title: "Berhasil", message: "Foto profil berhasil diperbarui!" });
        } catch (error) {
            console.error('Error uploading avatar:', error);
            setErrorDialog({ isOpen: true, title: "Gagal Mengunggah", message: 'Gagal mengunggah foto. Pastikan ukuran file < 1MB dan Anda sudah memasang bucket storage.' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-4 md:px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-2 min-w-0">
                        <Settings className="text-emerald-500 w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <h2 className="text-base sm:text-xl font-bold tracking-tight truncate">Pengaturan</h2>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Page Title Area */}
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Pengaturan Sistem</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">Kelola preferensi akun dan aplikasi peternakan Anda.</p>
                    </div>

                    <div className="space-y-6">

                        {/* Profile Section */}
                        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-emerald-500/10 rounded-3xl shadow-lg overflow-hidden glass-card">
                            <div className="p-4 sm:p-6 border-b border-emerald-500/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <User className="text-emerald-500 w-5 h-5" />
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Profil Pengguna</h3>
                                        <p className="text-sm text-slate-500">Informasi akun staf yang sedang login.</p>
                                    </div>
                                </div>
                                {!isEditingProfile ? (
                                    <button
                                        onClick={() => setIsEditingProfile(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-all font-bold text-sm"
                                    >
                                        <PenSquare className="w-4 h-4" />
                                        <span>Edit Profil</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setIsEditingProfile(false);
                                                setEditName(userName); // reset changes
                                            }}
                                            className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all font-bold text-sm"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSavingProfile}
                                            className="px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl transition-all font-bold text-sm disabled:opacity-50"
                                        >
                                            {isSavingProfile ? 'Menyimpan...' : 'Simpan'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 sm:p-6 space-y-6">
                                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 overflow-hidden">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <label className="cursor-pointer px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm inline-flex items-center justify-center overflow-hidden">
                                            {isUploading ? 'Sedang Mengunggah...' : 'Ubah Foto'}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                disabled={isUploading}
                                            />
                                        </label>
                                        <p className="text-xs text-slate-500 mt-2">JPG, GIF atau PNG. Maksimal ukuran 1MB.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nama Lengkap</label>
                                        {isEditingProfile ? (
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm outline-none text-slate-800 dark:text-slate-200"
                                                placeholder="Masukkan nama lengkap"
                                            />
                                        ) : (
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{userName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Peran Akun</label>
                                        <p className="inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm rounded-lg">{userRole}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Alamat Email (Supabase Auth)</label>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{userEmail}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Preferences Section */}
                        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-emerald-500/10 rounded-3xl shadow-lg overflow-hidden glass-card">
                            <div className="p-6 border-b border-emerald-500/10 flex items-center gap-3">
                                <Bell className="text-emerald-500 w-5 h-5" />
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Preferensi Aplikasi</h3>
                                    <p className="text-sm text-slate-500">Atur preferensi notifikasi dan peringatan sistem.</p>
                                </div>
                            </div>

                            <div className="p-2">
                                {/* Toggle 1 */}
                                <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors">
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">Notifikasi Stok Menipis</p>
                                        <p className="text-sm text-slate-500 mt-0.5">Dapatkan peringatan ketika pakan atau obat di bawah batas minimum.</p>
                                    </div>
                                    <button
                                        onClick={toggleStockNotif}
                                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out flex-shrink-0 ${stockNotif ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm ${stockNotif ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                    </button>
                                </div>

                                {/* Toggle 2 */}
                                <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors">
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">Notifikasi Vaksinasi</p>
                                        <p className="text-sm text-slate-500 mt-0.5">Pengingat pintar untuk jadwal vaksin dan pemeriksaan kesehatan otomatis.</p>
                                    </div>
                                    <button
                                        onClick={toggleVaccineNotif}
                                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out flex-shrink-0 ${vaccineNotif ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm ${vaccineNotif ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Admin Only: Audit Logs */}
                        {(userRole === 'Administrator' || userRole === 'Owner Peternakan') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-4 sm:p-6 glass-card flex flex-col justify-between gap-4 h-full">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Log Aktivitas Sistem</h3>
                                        <p className="text-sm text-slate-500 mt-1">Pantau semua perubahan data yang dilakukan oleh tim Anda.</p>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <a
                                            href="/settings/audit-logs"
                                            className="px-6 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold rounded-xl transition-colors inline-flex items-center gap-2"
                                        >
                                            Lihat Log
                                        </a>
                                    </div>
                                </div>

                                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-4 sm:p-6 glass-card flex flex-col justify-between gap-4 h-full">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Manajemen Pegawai</h3>
                                        <p className="text-sm text-slate-500 mt-1">Kelola hak akses dan peran (role) dari akun staff Anda.</p>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <a
                                            href="/settings/users"
                                            className="px-6 py-2.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 font-bold rounded-xl transition-colors inline-flex items-center gap-2"
                                        >
                                            Kelola Pegawai
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Standard Logout */}
                        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Sesi Akun</h3>
                                <p className="text-sm text-slate-500">Keluar dari aplikasi web SheepStock.</p>
                            </div>

                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold rounded-xl transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 inline-flex items-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Keluar
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>

            {/* Error Dialog */}
            {errorDialog?.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="p-6">
                            <div className="flex justify-center mb-4">
                                <div className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 p-3 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
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
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></svg>
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
