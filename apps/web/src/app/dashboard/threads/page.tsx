"use client";

import {
    MessageSquare,
    Plus,
    Search,
    Clock,
    Sparkles,
    ThumbsUp,
    MessageCircle,
    Pin,
    User,
} from "lucide-react";

const threads = [
    { id: "1", title: "Sprint Planning — Campus Q1 2026", channel: "Campus Recruiting", author: "Priya S.", time: "2h ago", replies: 12, likes: 5, pinned: true, aiSummary: "Discussed sprint goals: finalize Google panel, review 342 TechCorp applications, and set up Amazon assessment platform." },
    { id: "2", title: "AI Matcher v2 — Bias audit results", channel: "AI Platform", author: "David K.", time: "4h ago", replies: 8, likes: 3, pinned: true, aiSummary: "Bias audit shows 2.3% gender disparity in skill scoring. Proposed recalibration of embedding weights for non-CS backgrounds." },
    { id: "3", title: "Google campus visit logistics", channel: "Google Drive", author: "Marcus D.", time: "6h ago", replies: 15, likes: 7, pinned: false, aiSummary: null },
    { id: "4", title: "Weekly placement analytics review", channel: "Analytics", author: "AI Agent", time: "1d ago", replies: 4, likes: 2, pinned: false, aiSummary: "AI-generated summary: 28 placements this week, 93% match accuracy, TechCorp drive on track." },
    { id: "5", title: "Resume parser training data update", channel: "AI Platform", author: "Sarah L.", time: "1d ago", replies: 6, likes: 1, pinned: false, aiSummary: null },
    { id: "6", title: "Amazon coding assessment platform options", channel: "Amazon Drive", author: "Priya S.", time: "2d ago", replies: 22, likes: 9, pinned: false, aiSummary: "Compared HackerRank, CodeSignal, and custom platform. Team consensus: CodeSignal for MCQs, custom for live coding." },
];

export default function ThreadsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Threads</h1>
                    <p className="text-muted-foreground mt-1">Topic-based discussions with AI-powered summaries across all projects.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                    <Plus className="h-4 w-4" />
                    New Thread
                </button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Search threads..." className="input-field pl-9" />
            </div>

            <div className="space-y-3">
                {threads.map((thread, i) => (
                    <div key={thread.id} className="glass-card p-5 hover:border-primary/20 transition-all cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                                {thread.author.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    {thread.pinned && <Pin className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                                    <h3 className="text-sm font-semibold truncate">{thread.title}</h3>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                    <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium">{thread.channel}</span>
                                    <span>{thread.author}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{thread.time}</span>
                                </div>
                                {thread.aiSummary && (
                                    <div className="rounded-lg bg-primary/5 border border-primary/15 p-2.5 mt-2">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Sparkles className="h-3 w-3 text-primary" />
                                            <span className="text-[10px] font-semibold text-primary">AI Summary</span>
                                        </div>
                                        <p className="text-xs text-foreground/70 leading-relaxed">{thread.aiSummary}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{thread.replies}</span>
                                <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{thread.likes}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
