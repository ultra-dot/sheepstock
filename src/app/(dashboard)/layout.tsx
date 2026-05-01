"use client"

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname();
    const isSelectFarmPage = pathname === "/select-farm";

    return (
        <TooltipProvider>
            <SidebarProvider>
                {!isSelectFarmPage && <AppSidebar />}
                <main className={`w-full flex-1 h-screen overflow-hidden flex flex-col print:h-auto print:overflow-visible print:block ${isSelectFarmPage ? 'bg-slate-50 dark:bg-slate-950' : ''}`}>
                    {children}
                </main>
            </SidebarProvider>
        </TooltipProvider>
    );
}
