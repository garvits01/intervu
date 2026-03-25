"use client";

import { useState } from "react";
import {
    Puzzle,
    Search,
    Plus,
    CheckCircle2,
    Circle,
    ExternalLink,
    Zap,
} from "lucide-react";

const integrations = [
    { id: "1", name: "Slack", description: "Push notifications for placement events, task updates, and AI insights directly to Slack channels.", category: "Communication", connected: true, logo: "🔔" },
    { id: "2", name: "Google Calendar", description: "Auto-sync interview schedules, drive dates, and deadlines to Google Calendar.", category: "Scheduling", connected: true, logo: "📅" },
    { id: "3", name: "GitHub", description: "Track coding assessments, link repositories, and monitor candidate contributions.", category: "Developer", connected: true, logo: "🐙" },
    { id: "4", name: "HackerRank", description: "Import coding assessment scores and auto-rank candidates by performance.", category: "Assessment", connected: false, logo: "💻" },
    { id: "5", name: "Jira", description: "Bi-directional sync of tasks, sprints, and project boards between Haveloc and Jira.", category: "Project Mgmt", connected: false, logo: "📋" },
    { id: "6", name: "Notion", description: "Sync meeting notes, documentation, and knowledge base articles.", category: "Documentation", connected: false, logo: "📝" },
    { id: "7", name: "LinkedIn", description: "Import candidate profiles, fetch recommendations, and push job postings.", category: "Recruiting", connected: true, logo: "💼" },
    { id: "8", name: "Zoom", description: "Auto-generate Zoom meeting links for interviews and schedule virtual rounds.", category: "Meetings", connected: false, logo: "🎥" },
    { id: "9", name: "SendGrid", description: "Automated email notifications for candidates — offers, rejections, and reminders.", category: "Email", connected: true, logo: "📧" },
];

export default function IntegrationsPage() {
    const [search, setSearch] = useState("");
    const filtered = integrations.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                    <p className="text-muted-foreground mt-1">Connect your favorite tools to supercharge your workflow.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <span><strong className="text-foreground">{integrations.filter(i => i.connected).length}</strong> connected</span>
                </div>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search integrations..."
                    className="input-field pl-9"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((intg, i) => (
                    <div key={intg.id} className="glass-card p-5 hover-lift animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-xl">{intg.logo}</div>
                                <div>
                                    <h3 className="text-sm font-semibold">{intg.name}</h3>
                                    <span className="text-[10px] text-muted-foreground rounded bg-muted px-1.5 py-0.5">{intg.category}</span>
                                </div>
                            </div>
                            {intg.connected ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                                    <CheckCircle2 className="h-3 w-3" /> Connected
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    <Circle className="h-3 w-3" /> Available
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{intg.description}</p>
                        <button className={`w-full rounded-lg py-2 text-xs font-medium transition-all ${intg.connected
                            ? "border border-border bg-card/50 hover:bg-accent text-muted-foreground"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                            }`}>
                            {intg.connected ? "Configure" : "Connect"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
