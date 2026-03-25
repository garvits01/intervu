"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
    Plus,
    Search,
    Users,
    Clock,
    MoreHorizontal,
    CheckCircle2,
    AlertTriangle,
    Loader2,
} from "lucide-react";

interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    deadline?: string;
    _count: { tasks: number; threads: number; milestones: number };
}

function statusBadge(status: string) {
    if (status === "ACTIVE") return { color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2, label: "Active" };
    if (status === "COMPLETED") return { color: "bg-blue-500/15 text-blue-400", icon: CheckCircle2, label: "Completed" };
    if (status === "ON_HOLD") return { color: "bg-amber-500/15 text-amber-400", icon: AlertTriangle, label: "On Hold" };
    return { color: "bg-muted text-muted-foreground", icon: CheckCircle2, label: status };
}

export default function ProjectsPage() {
    const { data: session } = useSession();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!session?.user) return;
            const orgId = (session.user as any).orgId;
            const token = (session as any).accessToken;
            if (!orgId || !token) return;

            try {
                const res = await fetch(`http://localhost:4000/api/v1/projects?orgId=${orgId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setProjects(await res.json());
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setLoading(false);
            }
        };
        if (session) fetchProjects();
    }, [session]);

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
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-1">Track and manage all your active projects and placement drives.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                    <Plus className="h-4 w-4" />
                    New Project
                </button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Search projects..." className="input-field pl-9" />
            </div>

            {projects.length === 0 ? (
                <div className="glass-card p-12 text-center text-muted-foreground">No projects found for this organization.</div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {projects.map((project, i) => {
                        const sb = statusBadge(project.status);
                        const taskCount = project._count?.tasks || 0;
                        return (
                            <div key={project.id} className="glass-card p-6 hover-lift animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-sm font-semibold leading-tight pr-2">{project.name}</h3>
                                    <button className="rounded-lg p-1 hover:bg-accent transition-colors flex-shrink-0">
                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>

                                <span className={`status-badge mb-4 ${sb.color}`}>
                                    <sb.icon className="h-3 w-3" />
                                    {sb.label}
                                </span>

                                {project.description && (
                                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{project.description}</p>
                                )}

                                <div className="grid grid-cols-3 gap-3 mt-5 text-center">
                                    <div>
                                        <div className="text-sm font-bold">{taskCount}</div>
                                        <div className="text-[10px] text-muted-foreground">Tasks</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{project._count?.threads || 0}</div>
                                        <div className="text-[10px] text-muted-foreground">Threads</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold flex items-center justify-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {project.deadline ? new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">Deadline</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
