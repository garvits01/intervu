"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    CheckSquare,
    Plus,
    Search,
    Filter,
    Clock,
    Sparkles,
    MoreHorizontal,
    ChevronDown,
    AlertCircle,
    CheckCircle2,
    Circle,
    Eye,
    Loader2,
} from "lucide-react";

// Types matching API response
interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
    aiGenerated: boolean;
    projectIdx?: number;
    project?: { name: string };
    assignee?: { name: string; avatarUrl: string | null };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    TODO: { label: "To Do", color: "bg-muted text-muted-foreground", icon: Circle },
    IN_PROGRESS: { label: "In Progress", color: "bg-blue-500/15 text-blue-400", icon: Clock },
    IN_REVIEW: { label: "In Review", color: "bg-violet-500/15 text-violet-400", icon: Eye },
    DONE: { label: "Done", color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
    BLOCKED: { label: "Blocked", color: "bg-red-500/15 text-red-400", icon: AlertCircle },
};

function priorityDot(p: string) {
    if (p === "CRITICAL") return "bg-red-500";
    if (p === "HIGH") return "bg-amber-500";
    if (p === "MEDIUM") return "bg-blue-500";
    return "bg-muted-foreground";
}

export default function TasksPage() {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {
        const fetchTasks = async () => {
            if (!session?.user) return;
            try {
                const res = await fetch("http://localhost:4000/api/v1/tasks", {
                    headers: {
                        Authorization: `Bearer ${(session as any).accessToken}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setTasks(data.tasks || []);
                }
            } catch (error) {
                console.error("Failed to fetch tasks", error);
            } finally {
                setLoading(false);
            }
        };

        if (session) fetchTasks();
    }, [session]);

    const filtered = filter === "ALL" ? tasks : tasks.filter(t => t.status === filter);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground mt-1">Manage all project and placement tasks across your workspace.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                    <Plus className="h-4 w-4" />
                    New Task
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Search tasks..." className="input-field pl-9" />
                </div>
                {["ALL", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${filter === s ? "bg-primary text-primary-foreground" : "bg-card/50 border border-border text-muted-foreground hover:bg-accent"}`}
                    >
                        {s === "ALL" ? "All" : s.replace(/_/g, " ")}
                    </button>
                ))}
            </div>

            {/* Task List */}
            <div className="glass-card divide-y divide-border/50">
                {filtered.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No tasks found.
                    </div>
                ) : filtered.map((task, i) => {
                    const st = statusConfig[task.status] || statusConfig.TODO;
                    return (
                        <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                            <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${priorityDot(task.priority)}`} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{task.title}</span>
                                    {task.aiGenerated && (
                                        <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                            <Sparkles className="h-2.5 w-2.5" /> AI
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                    <span>{task.assignee?.name || "Unassigned"}</span>
                                    {task.dueDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(task.dueDate).toLocaleDateString()}</span>}
                                    {task.project && <span className="px-1.5 py-0.5 rounded bg-muted text-[10px]">{task.project.name}</span>}
                                </div>
                            </div>
                            <span className={`status-badge flex-shrink-0 ${st.color}`}>
                                <st.icon className="h-3 w-3" />
                                {st.label}
                            </span>
                            <button className="rounded-lg p-1.5 hover:bg-accent transition-colors">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-muted-foreground text-center">Showing {filtered.length} of {tasks.length} tasks</p>
        </div>
    );
}
