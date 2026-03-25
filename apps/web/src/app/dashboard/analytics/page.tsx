"use client";

import {
    BarChart3,
    TrendingUp,
    Users,
    Target,
    Activity,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Download,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
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

// ── Team Performance ──
const teamPerformance = [
    { week: "W1", tasksDone: 35, velocity: 28, bugs: 4 },
    { week: "W2", tasksDone: 42, velocity: 32, bugs: 6 },
    { week: "W3", tasksDone: 38, velocity: 30, bugs: 3 },
    { week: "W4", tasksDone: 51, velocity: 40, bugs: 2 },
    { week: "W5", tasksDone: 47, velocity: 37, bugs: 5 },
    { week: "W6", tasksDone: 55, velocity: 43, bugs: 3 },
    { week: "W7", tasksDone: 60, velocity: 48, bugs: 2 },
    { week: "W8", tasksDone: 58, velocity: 46, bugs: 1 },
];

// ── Placement Funnel ──
const funnelData = [
    { stage: "Applied", count: 1847, color: "#8b5cf6" },
    { stage: "Screened", count: 1200, color: "#6366f1" },
    { stage: "Matched", count: 680, color: "#3b82f6" },
    { stage: "Interviewed", count: 420, color: "#22c55e" },
    { stage: "Offered", count: 210, color: "#10b981" },
    { stage: "Placed", count: 156, color: "#059669" },
];

// ── Department Distribution ──
const deptDistribution = [
    { name: "CSE", value: 42, color: "#8b5cf6" },
    { name: "ECE", value: 22, color: "#3b82f6" },
    { name: "Mech", value: 15, color: "#22c55e" },
    { name: "Civil", value: 8, color: "#f59e0b" },
    { name: "EEE", value: 13, color: "#ef4444" },
];

// ── Monthly Revenue / ROI ──
const monthlyROI = [
    { month: "Sep", placements: 12, revenue: 24 },
    { month: "Oct", placements: 18, revenue: 36 },
    { month: "Nov", placements: 25, revenue: 50 },
    { month: "Dec", placements: 20, revenue: 40 },
    { month: "Jan", placements: 36, revenue: 72 },
    { month: "Feb", placements: 42, revenue: 84 },
];

// ── Top Companies ──
const topCompanies = [
    { company: "Google", placements: 28, avgScore: 92, packages: "₹28L" },
    { company: "Amazon", placements: 24, avgScore: 88, packages: "₹24L" },
    { company: "Microsoft", placements: 22, avgScore: 90, packages: "₹26L" },
    { company: "TechCorp", placements: 18, avgScore: 85, packages: "₹18L" },
    { company: "Cisco", placements: 15, avgScore: 87, packages: "₹20L" },
];

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

export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
                    <p className="text-muted-foreground mt-1">
                        AI-powered insights across projects, placements, and team performance.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select className="rounded-lg border border-border bg-card/50 px-3 py-2 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>This Year</option>
                    </select>
                    <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                        <Download className="h-4 w-4" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* ── KPI Row ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "Conversion Rate", value: "8.4%", change: "+1.2%", up: true, icon: Target, color: "text-purple-400", bg: "bg-purple-500/10" },
                    { label: "Avg. Match Score", value: "89%", change: "+3.5%", up: true, icon: Sparkles, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Time to Place", value: "14d", change: "-2d", up: true, icon: Calendar, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Active Pipelines", value: "12", change: "+2", up: true, icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10" },
                ].map((stat, i) => (
                    <div key={stat.label} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="flex items-center justify-between">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.up ? "text-emerald-400" : "text-red-400"}`}>
                                {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-2xl font-bold mt-3">{stat.value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Team Performance + Placement Funnel ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Team Performance */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Team Performance</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={teamPerformance}>
                            <defs>
                                <linearGradient id="teamGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" />
                            <XAxis dataKey="week" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="tasksDone"
                                stroke="#8b5cf6"
                                strokeWidth={2}
                                fill="url(#teamGrad)"
                                name="Tasks Done"
                                dot={{ fill: "#8b5cf6", strokeWidth: 0, r: 3 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="velocity"
                                stroke="#22c55e"
                                strokeWidth={2}
                                fill="none"
                                name="Velocity"
                                dot={{ fill: "#22c55e", strokeWidth: 0, r: 3 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Placement Funnel */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        <h2 className="text-lg font-semibold">Placement Funnel</h2>
                    </div>
                    <div className="space-y-4">
                        {funnelData.map((stage, i) => {
                            const maxCount = funnelData[0].count;
                            const pct = (stage.count / maxCount) * 100;
                            return (
                                <div key={stage.stage} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-sm font-medium">{stage.stage}</span>
                                        <span className="text-sm font-bold" style={{ color: stage.color }}>
                                            {stage.count.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-3 w-full rounded-full bg-muted/50 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000"
                                            style={{ width: `${pct}%`, background: stage.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Dept Distribution + Revenue ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Dept Pie */}
                <div className="glass-card p-6 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4 self-start">
                        <Users className="h-5 w-5 text-blue-400" />
                        <h2 className="text-lg font-semibold">By Department</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={deptDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {deptDistribution.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-2 text-xs">
                        {deptDistribution.map((item) => (
                            <div key={item.name} className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                                <span className="text-muted-foreground">{item.name} ({item.value}%)</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Trend */}
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="h-5 w-5 text-amber-400" />
                        <h2 className="text-lg font-semibold">Placement Impact (₹ Lakhs CTC)</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={monthlyROI}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 28% 17%)" />
                            <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="revenue" fill="#f59e0b" name="CTC (₹L)" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="placements" fill="#8b5cf6" name="Placements" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Top Companies ── */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Top Recruiting Companies</h2>
                <div className="glass-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border/50">
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Placements</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg. Match</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg. Package</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {topCompanies.map((c, i) => (
                                <tr key={c.company} className="hover:bg-accent/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                                    <td className="px-6 py-4 text-sm font-bold text-muted-foreground">{i + 1}</td>
                                    <td className="px-6 py-4 text-sm font-semibold">{c.company}</td>
                                    <td className="px-6 py-4 text-center text-sm font-medium">{c.placements}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-sm font-bold ${c.avgScore >= 90 ? "text-emerald-400" : "text-blue-400"}`}>
                                            {c.avgScore}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-semibold text-amber-400">{c.packages}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
