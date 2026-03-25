"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Plus,
    Search,
    Filter,
    Users,
    Calendar,
    Building2,
    Sparkles,
    FileUp,
    CheckCircle2,
    MoreHorizontal,
    Loader2,
} from "lucide-react";

interface Drive {
    id: string;
    title: string;
    company: string;
    status: string;
    startDate: string;
    endDate?: string;
    _count: { registrations: number; jobs: number; matchResults: number };
}

function driveStatusBadge(status: string) {
    const styles: Record<string, string> = {
        DRAFT: "bg-muted text-muted-foreground",
        REGISTRATION_OPEN: "bg-blue-500/15 text-blue-400",
        IN_PROGRESS: "bg-amber-500/15 text-amber-400",
        EVALUATION: "bg-violet-500/15 text-violet-400",
        COMPLETED: "bg-emerald-500/15 text-emerald-400",
        CANCELLED: "bg-red-500/15 text-red-400",
    };
    return styles[status] || styles.DRAFT;
}

export default function PlacementsPage() {
    const { data: session } = useSession();
    const [drives, setDrives] = useState<Drive[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDrives = async () => {
            if (!session?.user) return;
            const orgId = (session.user as any).orgId;
            const token = (session as any).accessToken;
            if (!orgId || !token) return;

            try {
                const res = await fetch(`http://localhost:4000/api/v1/placements/drives?orgId=${orgId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setDrives(await res.json());
            } catch (error) {
                console.error("Failed to fetch drives", error);
            } finally {
                setLoading(false);
            }
        };
        if (session) fetchDrives();
    }, [session]);

    const totalRegistrations = drives.reduce((sum, d) => sum + (d._count?.registrations || 0), 0);
    const totalMatches = drives.reduce((sum, d) => sum + (d._count?.matchResults || 0), 0);

    const computedStats = [
        { label: "Total Drives", value: String(drives.length), icon: Building2, color: "text-purple-400", bgColor: "bg-purple-500/10" },
        { label: "Registrations", value: String(totalRegistrations), icon: Users, color: "text-blue-400", bgColor: "bg-blue-500/10" },
        { label: "AI Matches", value: String(totalMatches), icon: CheckCircle2, color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
        { label: "Job Roles", value: String(drives.reduce((s, d) => s + (d._count?.jobs || 0), 0)), icon: Sparkles, color: "text-amber-400", bgColor: "bg-amber-500/10" },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Placement Automation</h1>
                    <p className="text-muted-foreground mt-1">
                        AI-powered campus recruiting — manage drives, match candidates, and track placements.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition-all hover:bg-accent">
                        <FileUp className="h-4 w-4" />
                        Bulk Upload
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                        <Plus className="h-4 w-4" />
                        New Drive
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {computedStats.map((stat, i) => (
                    <div key={stat.label} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgColor}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-xs text-muted-foreground">{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Search & Filter Bar ── */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Search drives, companies..." className="input-field pl-9" />
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm transition-all hover:bg-accent">
                    <Filter className="h-4 w-4" />
                    Filter
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm text-primary transition-all hover:bg-primary/10">
                    <Sparkles className="h-4 w-4" />
                    AI Match All
                </button>
            </div>

            {/* ── Drives Table ── */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Drive</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Schedule</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registrations</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Job Roles</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Matches</th>
                                <th className="px-6 py-4" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {drives.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        No placement drives found.
                                    </td>
                                </tr>
                            ) : drives.map((drive, i) => (
                                <tr key={drive.id} className="hover:bg-accent/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-semibold">{drive.title}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                                <Building2 className="h-3 w-3" />
                                                {drive.company}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`status-badge ${driveStatusBadge(drive.status)}`}>
                                            {drive.status.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm flex items-center gap-1.5 text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(drive.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-medium">{drive._count?.registrations || 0}</td>
                                    <td className="px-6 py-4 text-center text-sm font-medium">{drive._count?.jobs || 0}</td>
                                    <td className="px-6 py-4 text-center text-sm font-bold text-emerald-400">{drive._count?.matchResults || 0}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="rounded-lg p-1.5 hover:bg-accent transition-colors">
                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
