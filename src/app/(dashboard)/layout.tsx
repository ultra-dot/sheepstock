import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full flex-1 h-screen overflow-hidden flex flex-col">
                    {children}
                </main>
            </SidebarProvider>
        </TooltipProvider>
    );
}
