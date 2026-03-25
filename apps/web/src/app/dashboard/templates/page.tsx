import {
    FileText,
    Plus,
    Search,
    Copy,
    Clock,
    Star,
    MoreHorizontal,
    Briefcase,
    Users,
    BarChart3,
} from "lucide-react";

const templates = [
    { id: "1", name: "Software Engineer — JD Template", category: "Job Descriptions", uses: 45, starred: true, updatedAt: "Feb 15, 2026", icon: Briefcase },
    { id: "2", name: "Campus Placement Drive Checklist", category: "Checklists", uses: 32, starred: true, updatedAt: "Feb 12, 2026", icon: FileText },
    { id: "3", name: "Weekly Placement Analytics Report", category: "Reports", uses: 28, starred: false, updatedAt: "Feb 14, 2026", icon: BarChart3 },
    { id: "4", name: "Candidate Rejection Email", category: "Emails", uses: 67, starred: false, updatedAt: "Feb 10, 2026", icon: FileText },
    { id: "5", name: "Offer Letter — Standard Format", category: "Offers", uses: 23, starred: true, updatedAt: "Feb 8, 2026", icon: FileText },
    { id: "6", name: "Interview Feedback Form", category: "Forms", uses: 51, starred: false, updatedAt: "Feb 5, 2026", icon: Users },
    { id: "7", name: "Sprint Retrospective Template", category: "Agile", uses: 19, starred: false, updatedAt: "Feb 3, 2026", icon: FileText },
    { id: "8", name: "Data Analyst — JD Template", category: "Job Descriptions", uses: 38, starred: false, updatedAt: "Jan 28, 2026", icon: Briefcase },
];

export default function TemplatesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
                    <p className="text-muted-foreground mt-1">Reusable templates for JDs, emails, reports, and checklists.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                    <Plus className="h-4 w-4" /> New Template
                </button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input type="text" placeholder="Search templates..." className="input-field pl-9" />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {templates.map((t, i) => (
                    <div key={t.id} className="glass-card p-5 hover-lift animate-fade-in cursor-pointer" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <t.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex items-center gap-1">
                                {t.starred && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
                                <button className="rounded-lg p-1 hover:bg-accent transition-colors">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-sm font-semibold mb-1 leading-tight">{t.name}</h3>
                        <span className="inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground mb-3">{t.category}</span>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Copy className="h-3 w-3" />{t.uses} uses</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.updatedAt}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
