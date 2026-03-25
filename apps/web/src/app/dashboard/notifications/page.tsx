"use client";

import {
    Bell,
    CheckCircle2,
    AlertTriangle,
    Sparkles,
    Users,
    MessageSquare,
    Briefcase,
    Clock,
    Check,
    Trash2,
} from "lucide-react";
import { useState } from "react";

const initialNotifications = [
    { id: "1", type: "ai", icon: Sparkles, title: "3 tasks auto-generated from standup", description: 'AI detected action items and created tasks for "Campus Recruiting Q1" project.', time: "5m ago", read: false },
    { id: "2", type: "warning", icon: AlertTriangle, title: "Delay risk: SRM Placement Drive", description: "Sprint 4 velocity is 15% below target. May miss March 15 deadline.", time: "1h ago", read: false },
    { id: "3", type: "success", icon: CheckCircle2, title: "28 new placements confirmed", description: "Amazon SDE-1 drive completed with 28 successful placements out of 30 positions.", time: "2h ago", read: false },
    { id: "4", type: "team", icon: Users, title: "Marcus D. joined Google Drive project", description: "New team member added to the Google SDE Intern Drive project.", time: "3h ago", read: true },
    { id: "5", type: "message", icon: MessageSquare, title: "New reply in: AI Matcher v2 bias audit", description: "David K. replied: 'Recalibration results look promising, bias reduced to 0.8%.'", time: "4h ago", read: true },
    { id: "6", type: "ai", icon: Sparkles, title: "Weekly analytics report ready", description: "AI-generated placement analytics for Week 7 is ready for review.", time: "6h ago", read: true },
    { id: "7", type: "project", icon: Briefcase, title: "Microsoft Engage Program completed", description: "All 38 tasks completed. 42 placements made against 40 positions target.", time: "1d ago", read: true },
    { id: "8", type: "warning", icon: AlertTriangle, title: "API rate limit approaching", description: "OpenAI API usage at 85% of monthly quota. Consider switching to Groq fallback.", time: "1d ago", read: true },
];

function typeColor(type: string) {
    if (type === "ai") return "text-primary bg-primary/10";
    if (type === "warning") return "text-amber-500 bg-amber-500/10";
    if (type === "success") return "text-emerald-500 bg-emerald-500/10";
    if (type === "message") return "text-blue-500 bg-blue-500/10";
    return "text-violet-500 bg-violet-500/10";
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(initialNotifications);
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{unreadCount}</span>
                        )}
                    </h1>
                    <p className="text-muted-foreground mt-1">Stay updated on projects, placements, and AI agent activities.</p>
                </div>
                <button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition-all hover:bg-accent">
                    <Check className="h-4 w-4" />
                    Mark All Read
                </button>
            </div>

            <div className="space-y-2">
                {notifications.map((n, i) => (
                    <div
                        key={n.id}
                        className={`glass-card p-4 transition-all animate-fade-in cursor-pointer hover:border-primary/20 ${!n.read ? "border-l-2 border-l-primary" : "opacity-70"}`}
                        style={{ animationDelay: `${i * 40}ms` }}
                        onClick={() => setNotifications(notifications.map(nn => nn.id === n.id ? { ...nn, read: true } : nn))}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${typeColor(n.type)}`}>
                                <n.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold">{n.title}</h3>
                                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.description}</p>
                            </div>
                            <span className="text-xs text-muted-foreground flex-shrink-0 flex items-center gap-1">
                                <Clock className="h-3 w-3" />{n.time}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
