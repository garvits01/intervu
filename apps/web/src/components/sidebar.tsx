"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    Briefcase,
    BarChart3,
    FileText,
    Settings,
    Sparkles,
    MessageSquare,
    Puzzle,
    ChevronLeft,
    Bell,
    Search,
    LogOut,
    LogIn,
} from "lucide-react";
import { useState } from "react";
import { canAccessRoute, getRoleLabel } from "@/lib/rbac";

const navigation = [
    {
        section: "Core",
        items: [
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
            { name: "Projects", href: "/dashboard/projects", icon: Briefcase },
            { name: "Threads", href: "/dashboard/threads", icon: MessageSquare },
        ],
    },
    {
        section: "Placements",
        items: [
            { name: "Drives", href: "/placements", icon: Users },
            { name: "AI Matcher", href: "/placements/matcher", icon: Sparkles },
            { name: "Candidates", href: "/placements/candidates", icon: Users },
        ],
    },
    {
        section: "Analytics",
        items: [
            { name: "Reports", href: "/dashboard/analytics", icon: BarChart3 },
            { name: "Templates", href: "/dashboard/templates", icon: FileText },
        ],
    },
    {
        section: "System",
        items: [
            { name: "Integrations", href: "/dashboard/integrations", icon: Puzzle },
            { name: "Settings", href: "/dashboard/settings", icon: Settings },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const { data: session, status } = useSession();

    // Get user info from session
    const userName = session?.user?.name || "Guest";
    const userRole = (session?.user as any)?.role as string | undefined;
    const userInitial = userName.charAt(0).toUpperCase();
    const roleLabel = getRoleLabel(userRole);

    // Filter navigation items based on user role
    const filteredNavigation = navigation
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => canAccessRoute(userRole, item.href)),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <aside
            className={`relative flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[260px]"
                }`}
        >
            {/* ── Logo ── */}
            <div className="flex h-16 items-center gap-3 px-4 border-b border-border/50">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/20 flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-white" />
                </div>
                {!collapsed && (
                    <span className="text-lg font-bold tracking-tight">
                        Haveloc <span className="text-primary">Pro</span>
                    </span>
                )}
            </div>

            {/* ── Search ── */}
            {!collapsed && (
                <div className="px-3 pt-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="input-field pl-9 h-9 text-xs bg-background/50"
                        />
                    </div>
                </div>
            )}

            {/* ── Navigation ── */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
                {filteredNavigation.map((group) => (
                    <div key={group.section} className="mb-4">
                        {!collapsed && (
                            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                                {group.section}
                            </div>
                        )}
                        <div className="space-y-0.5">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`nav-link ${isActive ? "nav-link-active" : ""
                                            } ${collapsed ? "justify-center px-2" : ""}`}
                                        title={collapsed ? item.name : undefined}
                                    >
                                        <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                                        {!collapsed && <span>{item.name}</span>}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ── Bottom Actions ── */}
            <div className="border-t border-border/50 p-3 space-y-2">
                {/* Notifications */}
                <Link
                    href="/dashboard/notifications"
                    className={`nav-link ${collapsed ? "justify-center px-2" : ""}`}
                >
                    <div className="relative">
                        <Bell className="h-4.5 w-4.5" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse-ring" />
                    </div>
                    {!collapsed && <span>Notifications</span>}
                    {!collapsed && (
                        <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            3
                        </span>
                    )}
                </Link>

                {/* User Info or Sign-In */}
                {status === "authenticated" && session?.user ? (
                    <>
                        <div
                            className={`flex items-center gap-3 rounded-lg bg-accent/50 p-2.5 ${collapsed ? "justify-center" : ""
                                }`}
                        >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                {userInitial}
                            </div>
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{userName}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {roleLabel}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sign Out */}
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className={`nav-link w-full text-left hover:text-red-400 hover:bg-red-500/10 transition-colors ${collapsed ? "justify-center px-2" : ""
                                }`}
                            title={collapsed ? "Sign Out" : undefined}
                        >
                            <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
                            {!collapsed && <span>Sign Out</span>}
                        </button>
                    </>
                ) : (
                    <Link
                        href="/login"
                        className={`nav-link ${collapsed ? "justify-center px-2" : ""}`}
                    >
                        <LogIn className="h-4.5 w-4.5 flex-shrink-0" />
                        {!collapsed && <span>Sign In</span>}
                    </Link>
                )}
            </div>

            {/* ── Collapse Toggle ── */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-accent transition-colors z-10"
            >
                <ChevronLeft
                    className={`h-3 w-3 transition-transform ${collapsed ? "rotate-180" : ""
                        }`}
                />
            </button>
        </aside>
    );
}
