import {
    Search,
    Filter,
    Users,
    Mail,
    GraduationCap,
    Award,
    ArrowUpRight,
    MoreHorizontal,
    Sparkles,
    Download,
} from "lucide-react";

const candidates = [
    { id: "1", name: "Aarav Patel", email: "aarav.p@srmist.edu.in", department: "CSE", cgpa: 8.9, skills: ["Python", "ML", "TensorFlow", "Docker"], matchScore: 94, status: "MATCHED", drives: 2 },
    { id: "2", name: "Sneha Gupta", email: "sneha.g@iitb.ac.in", department: "CSE", cgpa: 9.2, skills: ["Java", "Spring Boot", "K8s", "React"], matchScore: 92, status: "PLACED", drives: 1 },
    { id: "3", name: "Rahul Sharma", email: "rahul.s@bits.edu.in", department: "CSE", cgpa: 8.5, skills: ["React", "Node", "MongoDB", "Docker"], matchScore: 89, status: "INTERVIEWING", drives: 3 },
    { id: "4", name: "Priya Krishnan", email: "priya.k@iitkgp.ac.in", department: "ECE", cgpa: 9.0, skills: ["C++", "Networking", "CCNA", "Linux"], matchScore: 96, status: "PLACED", drives: 1 },
    { id: "5", name: "Arjun Mehta", email: "arjun.m@vit.edu.in", department: "CSE", cgpa: 8.3, skills: ["Python", "Django", "AWS", "PostgreSQL"], matchScore: 85, status: "SHORTLISTED", drives: 4 },
    { id: "6", name: "Kavya Reddy", email: "kavya.r@nit.edu.in", department: "ECE", cgpa: 8.7, skills: ["Embedded", "VHDL", "Python", "IoT"], matchScore: 78, status: "REGISTERED", drives: 2 },
    { id: "7", name: "Rohan Das", email: "rohan.d@iitd.ac.in", department: "CSE", cgpa: 9.4, skills: ["ML", "PyTorch", "Go", "K8s"], matchScore: 97, status: "PLACED", drives: 1 },
    { id: "8", name: "Ananya Singh", email: "ananya.s@iisc.ac.in", department: "AI&DS", cgpa: 9.1, skills: ["NLP", "Transformers", "Python", "FastAPI"], matchScore: 93, status: "INTERVIEWING", drives: 2 },
];

function statusBadge(status: string) {
    const map: Record<string, string> = {
        REGISTERED: "bg-muted text-muted-foreground",
        SHORTLISTED: "bg-blue-500/15 text-blue-400",
        MATCHED: "bg-violet-500/15 text-violet-400",
        INTERVIEWING: "bg-amber-500/15 text-amber-400",
        PLACED: "bg-emerald-500/15 text-emerald-400",
    };
    return map[status] || map.REGISTERED;
}

export default function CandidatesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
                    <p className="text-muted-foreground mt-1">Browse, filter, and manage all placement candidates across drives.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition-all hover:bg-accent">
                        <Download className="h-4 w-4" /> Export CSV
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                        <Sparkles className="h-4 w-4" /> AI Match All
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" placeholder="Search candidates..." className="input-field pl-9" />
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm transition-all hover:bg-accent">
                    <Filter className="h-4 w-4" /> Filter
                </button>
            </div>

            <div className="glass-card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/50">
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Candidate</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dept</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">CGPA</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skills</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Score</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                            <th className="px-6 py-4" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {candidates.map((c, i) => (
                            <tr key={c.id} className="hover:bg-accent/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                            {c.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">{c.name}</div>
                                            <div className="text-xs text-muted-foreground">{c.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">{c.department}</td>
                                <td className="px-6 py-4 text-center text-sm font-medium">{c.cgpa}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {c.skills.slice(0, 3).map(s => (
                                            <span key={s} className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium">{s}</span>
                                        ))}
                                        {c.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{c.skills.length - 3}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-sm font-bold ${c.matchScore >= 90 ? "text-emerald-400" : c.matchScore >= 80 ? "text-blue-400" : "text-amber-400"}`}>
                                        {c.matchScore}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`status-badge ${statusBadge(c.status)}`}>{c.status}</span>
                                </td>
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
    );
}
