"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import {
    BarChart3,
    CheckCircle2,
    Clock,
    AlertTriangle,
    TrendingUp,
    Users,
    Briefcase,
    ArrowUpRight,
    Sparkles,
    Plus,
    Activity,
    Target,
} from "lucide-react";
import Link from "next/link";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";

// ── KPI Data ──
const kpis = [
    {
        title: "Active Projects",
        value: "24",
        change: "+3",
        changeType: "positive" as const,
        icon: Briefcase,
        gradient: "from-purple-500 to-violet-600",
    },
    {
        title: "Tasks Completed",
        value: "847",
        change: "+12% this week",
        changeType: "positive" as const,
        icon: CheckCircle2,
        gradient: "from-emerald-500 to-green-600",
    },
    {
        title: "Placements Made",
        value: "156",
        change: "+28 this month",
        changeType: "positive" as const,
        icon: Users,
        gradient: "from-cyan-500 to-blue-600",
    },
    {
        title: "AI Predictions",
        value: "93%",
        change: "accuracy",
        changeType: "neutral" as const,
        icon: Sparkles,
        gradient: "from-amber-500 to-orange-600",
    },
];

// ── Chart Data ──
const velocityData = [
    { sprint: "S1", velocity: 24, predicted: 22 },
    { sprint: "S2", velocity: 28, predicted: 26 },
    { sprint: "S3", velocity: 31, predicted: 29 },
    { sprint: "S4", velocity: 27, predicted: 30 },
    { sprint: "S5", velocity: 35, predicted: 32 },
    { sprint: "S6", velocity: 33, predicted: 34 },
    { sprint: "S7", velocity: 38, predicted: 35 },
    { sprint: "S8", velocity: 42, predicted: 37 },
];

const placementTrend = [
    { month: "Sep", matched: 18, placed: 12, offers: 15 },
    { month: "Oct", matched: 24, placed: 18, offers: 22 },
    { month: "Nov", matched: 32, placed: 25, offers: 29 },
    { month: "Dec", matched: 28, placed: 20, offers: 24 },
    { month: "Jan", matched: 45, placed: 36, offers: 40 },
    { month: "Feb", matched: 52, placed: 42, offers: 48 },
];

const matchDistribution = [
    { name: "Excellent (90%+)", value: 45, color: "#22c55e" },
    { name: "Good (75-89%)", value: 30, color: "#3b82f6" },
    { name: "Fair (60-74%)", value: 18, color: "#f59e0b" },
    { name: "Low (<60%)", value: 7, color: "#ef4444" },
];

// ── Recent Tasks ──
const recentTasks = [
    {
        id: "1",
        title: "Review placement drive applications for TechCorp",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assignee: "Priya S.",
        dueDate: "Feb 18",
        aiGenerated: true,
    },
    {
        id: "2",
        title: "Finalize interview panel for Google campus visit",
        status: "TODO",
        priority: "CRITICAL",
        assignee: "Marcus D.",
        dueDate: "Feb 19",
        aiGenerated: false,
    },
    {
        id: "3",
        title: "AI: Send reminder emails to unregistered candidates",
        status: "DONE",
        priority: "MEDIUM",
        assignee: "AI Agent",
        dueDate: "Feb 16",
        aiGenerated: true,
    },
    {
        id: "4",
        title: "Update resume parsing model with new training data",
        status: "IN_REVIEW",
        priority: "HIGH",
        assignee: "David K.",
        dueDate: "Feb 20",
        aiGenerated: false,
    },
    {
        id: "5",
        title: "Generate weekly placement analytics report",
        status: "TODO",
        priority: "LOW",
        assignee: "AI Agent",
        dueDate: "Feb 21",
        aiGenerated: true,
    },
];

// ── AI Insights ──
const aiInsights = [
    {
        type: "warning",
        icon: AlertTriangle,
        title: "Delay Risk Detected",
        description:
            'Sprint 4 velocity is 15% below target. "SRM Placement Drive" may miss March 15 deadline.',
        action: "View Analysis",
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
    },
    {
        type: "success",
        icon: TrendingUp,
        title: "Placement Rate Improving",
        description:
            "AI matching accuracy improved to 93% this week. 28 more placements than last month.",
        action: "View Report",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
    },
    {
        type: "info",
        icon: Sparkles,
        title: "3 Tasks Auto-Generated",
        description:
            'AI detected action items from today\'s standup and created tasks for "Campus Recruiting Q1" project.',
        action: "Review Tasks",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
];

// ── Upcoming Drives ──
const upcomingDrives = [
    {
        company: "TechCorp Inc.",
        date: "Mar 15, 2026",
        candidates: 342,
        positions: 25,
        matchRate: "87%",
    },
    {
        company: "Google",
        date: "Mar 22, 2026",
        candidates: 512,
        positions: 15,
        matchRate: "91%",
    },
    {
        company: "Amazon",
        date: "Apr 5, 2026",
        candidates: 289,
        positions: 30,
        matchRate: "84%",
    },
];

function statusColor(status: string): string {
    switch (status) {
        case "DONE":
            return "bg-emerald-500/15 text-emerald-400";
        case "IN_PROGRESS":
            return "bg-blue-500/15 text-blue-400";
        case "IN_REVIEW":
            return "bg-violet-500/15 text-violet-400";
        case "BLOCKED":
            return "bg-red-500/15 text-red-400";
        default:
            return "bg-muted text-muted-foreground";
    }
}

function priorityDot(priority: string): string {
    switch (priority) {
        case "CRITICAL":
            return "bg-red-500";
        case "HIGH":
            return "bg-amber-500";
        case "MEDIUM":
            return "bg-blue-500";
        default:
            return "bg-muted-foreground";
    }
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
        <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur-xl p-3 shadow-xl">
            <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className="text-xs" style={{ color: entry.color }}>
                    {entry.name}: <span className="font-bold">{entry.value}</span>
                </p>
            ))}
        </div>
    );
};

const DashboardPage = () => {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);
    const [drives, setDrives] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user) return;
            const orgId = (session.user as any).orgId;
            const token = (session as any).accessToken;
            if (!orgId || !token) return;

            try {
                const [statsRes, drivesRes, tasksRes] = await Promise.all([
                    fetch(`http://localhost:4000/api/v1/analytics/dashboard?orgId=${orgId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch(`http://localhost:4000/api/v1/placements/drives?orgId=${orgId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch(`http://localhost:4000/api/v1/tasks`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (drivesRes.ok) setDrives(await drivesRes.json());
                if (tasksRes.ok) {
                    const tData = await tasksRes.json();
                    setTasks(tData.tasks?.slice(0, 5) || []);
                }
            } catch (error) {
                console.error("Dashboard fetch error", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchData();
    }, [session]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[500px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard insights...</p>
                </div>
            </div>
        );
    }

    // Default KPI data if API returns structure or maps it
    // For now projecting API stats to UI
    const dynamicKpIs = [
        {
            title: "Active Projects",
            value: stats?.activeProjects || "0",
            change: "+1",
            changeType: "positive",
            icon: Briefcase,
            gradient: "from-purple-500 to-violet-600",
        },
        {
            title: "Tasks Completed",
            value: stats?.completedTasks || "0",
            change: "Total",
            changeType: "positive",
            icon: CheckCircle2,
            gradient: "from-emerald-500 to-green-600",
        },
        {
            title: "Placements Driven",
            value: stats?.totalDrives || "0",
            change: "Active",
            changeType: "neutral",
            icon: Users,
            gradient: "from-cyan-500 to-blue-600",
        },
        {
            title: "Engagement",
            value: "High",
            change: "stable",
            changeType: "neutral",
            icon: Sparkles,
            gradient: "from-amber-500 to-orange-600",
        },
    ];

    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {(session?.user as any)?.name?.split(" ")[0]}. Here&apos;s what&apos;s happening.
                    </p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                    <Plus className="h-4 w-4" />
                    New Project
                </button>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {dynamicKpIs.map((kpi, i) => (
                    <div
                        key={kpi.title}
                        className="kpi-card animate-fade-in"
                        style={{ animationDelay: `${i * 80}ms` }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div
                                className={`inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${kpi.gradient} shadow-lg`}
                            >
                                <kpi.icon className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {kpi.title}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Charts Row (Static for visual flair for now, but scalable) ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Sprint Velocity</h2>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={velocityData}>
                            <defs>
                                <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" />
                            <XAxis dataKey="sprint" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="velocity"
                                stroke="#a855f7"
                                strokeWidth={2.5}
                                fill="url(#velocityGrad)"
                                name="Actual"
                                dot={{ fill: "#a855f7", strokeWidth: 0, r: 3 }}
                                activeDot={{ r: 5, stroke: "#a855f7", strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            <h2 className="text-lg font-semibold">Placement Trend</h2>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={placementTrend} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" />
                            <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="matched" fill="#8b5cf6" name="Matched" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="offers" fill="#3b82f6" name="Offers" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="placed" fill="#22c55e" name="Placed" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Recent Tasks ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Recent Tasks</h2>
                    <Link
                        href="/dashboard/tasks"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                        View All <ArrowUpRight className="h-3 w-3" />
                    </Link>
                </div>
                <div className="glass-card divide-y divide-border/50">
                    {tasks.map((task, i) => (
                        <div
                            key={task.id}
                            className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors animate-fade-in"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <div
                                className={`h-2 w-2 rounded-full flex-shrink-0 ${priorityDot(
                                    task.priority
                                )}`}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium truncate">
                                        {task.title}
                                    </span>
                                    {task.aiGenerated && (
                                        <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                            <Sparkles className="h-2.5 w-2.5" />
                                            AI
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-muted-foreground">
                                        {task.assignee?.name || "Unassigned"}
                                    </span>
                                    {task.dueDate && <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </span>}
                                </div>
                            </div>
                            <span
                                className={`status-badge flex-shrink-0 ${statusColor(
                                    task.status
                                )}`}
                            >
                                {task.status.replace("_", " ")}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Upcoming Placement Drives ── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Upcoming Placement Drives</h2>
                    <Link
                        href="/placements"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                    >
                        View All <ArrowUpRight className="h-3 w-3" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {drives.map((drive, i) => (
                        <div
                            key={drive.id}
                            className="glass-card p-6 hover-lift animate-fade-in"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">{drive.company}</h3>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(drive.date).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-lg font-bold">{drive._count?.candidates || 0}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Candidates
                                    </div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold">{drive.jobRoles?.length || 0}</div>
                                    <div className="text-xs text-muted-foreground">Roles</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-emerald-400">
                                        {drive.status}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Status</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
