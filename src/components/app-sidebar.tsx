"use client"

import { Activity, Box, LayoutDashboard, Settings, PawPrint, LogOut, Warehouse, UserCircle } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { logout } from "@/app/actions/auth"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

// Menu items
const items = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Manajemen Kandang",
        url: "/cages",
        icon: Warehouse,
    },
    {
        title: "Inventori Ternak",
        url: "/livestock",
        icon: PawPrint,
    },
    {
        title: "Manajemen Pakan",
        url: "/inventory",
        icon: Box,
    },
    {
        title: "Kesehatan",
        url: "/health",
        icon: Activity,
    },
    {
        title: "Pengaturan",
        url: "/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname();
    const [userName, setUserName] = useState("Admin Peternakan");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('name').eq('id', user.id).single();
                if (profile?.name) setUserName(profile.name);
                if (user.user_metadata?.avatar_url) setAvatarUrl(user.user_metadata.avatar_url);
            }
        };

        fetchUser();

        // Listen for auth/metadata changes to keep avatar synced
        const { data: { subscription } } = createClient().auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                if (session.user.user_metadata?.avatar_url) {
                    setAvatarUrl(session.user.user_metadata.avatar_url);
                }
                // Re-fetch profile on change to grab fresh name
                fetchUser();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <Sidebar className="border-r border-emerald-500/10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">

            {/* Header */}
            <SidebarHeader className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                        <PawPrint className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-none">SheepStock</h1>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">© MitraTani Farm</p>
                    </div>
                </div>
            </SidebarHeader>

            {/* Content (Navigation) */}
            <SidebarContent className="px-4 mt-2">
                <nav className="flex-1 space-y-2">
                    {items.map((item) => {
                        const isActive = pathname === item.url;
                        return (
                            <Link
                                href={item.url}
                                key={item.title}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-emerald-500/5 hover:text-emerald-600"
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="text-sm">{item.title}</span>
                            </Link>
                        )
                    })}
                </nav>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="p-4 border-t border-emerald-500/10">
                {/* Profile Widget */}
                <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-xl mb-3 border border-emerald-500/10 hidden md:flex">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex flex-shrink-0 items-center justify-center text-emerald-600 overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle className="w-5 h-5" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{userName}</p>
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <form action={logout} className="w-full">
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-2 text-sm text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/50 w-full p-2.5 rounded-xl transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar</span>
                    </button>
                </form>
            </SidebarFooter>
        </Sidebar>
    )
}
