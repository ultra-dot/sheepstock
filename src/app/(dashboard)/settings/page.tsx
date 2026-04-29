"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Settings, User, Bell, LogOut, PenSquare } from "lucide-react"
import { useState, useEffect } from "react"
import { logout } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
    const [stockNotif, setStockNotif] = useState(true);
    const [vaccineNotif, setVaccineNotif] = useState(true);
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
                if (profile) {
                    setUserName(profile.name || "Tanpa Nama");
                    setEditName(profile.name || "");
                    setUserRole(profile.role === 'admin' ? 'Administrator' : 'Staf');
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
            const { error } = await supabase
                .from('profiles')
                .update({ name: editName })
                .eq('id', userId);

            if (error) throw error;

            setUserName(editName);
            setIsEditingProfile(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Gagal menyimpan profil.');
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
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Gagal mengunggah foto. Pastikan ukuran file < 1MB dan Anda sudah memasang bucket storage.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-20 sticky top-0 z-30 bg-white/30 dark:bg-slate-950/30 backdrop-blur-md border-b border-emerald-500/10 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <div className="flex items-center gap-3 ml-2">
                        <Settings className="text-emerald-500 w-6 h-6" />
                        <h2 className="text-xl font-bold tracking-tight">Pengaturan</h2>
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
                            <div className="p-6 border-b border-emerald-500/10 flex justify-between items-center">
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

                            <div className="p-6 space-y-6">
                                <div className="flex items-center gap-6">
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
                                        onClick={() => setStockNotif(!stockNotif)}
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
                                        onClick={() => setVaccineNotif(!vaccineNotif)}
                                        className={`w-12 h-6 rounded-full relative transition-colors duration-300 ease-in-out flex-shrink-0 ${vaccineNotif ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out shadow-sm ${vaccineNotif ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Standard Logout */}
                        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 glass-card flex items-center justify-between">
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
                                    Keluar (Logout)
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
