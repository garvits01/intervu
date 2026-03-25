"use client";

import { useState } from "react";
import {
    Sparkles,
    Search,
    Upload,
    ArrowUpRight,
    CheckCircle2,
    AlertTriangle,
    ChevronDown,
    FileText,
    User,
    Shield,
    Zap,
    RefreshCw,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
} from "recharts";

// ── Demo Candidates ──
const demoCandidates = [
    {
        id: "c1",
        name: "Aarav Patel",
        email: "aarav.p@srmist.edu.in",
        skills: ["python", "machine learning", "docker", "tensorflow", "aws"],
        experience: "2 years ML Engineer Intern at TCS",
        education: "B.Tech CSE — SRM IST (8.9 CGPA)",
        resumeScore: 92,
    },
    {
        id: "c2",
        name: "Sneha Gupta",
        email: "sneha.g@iitb.ac.in",
        skills: ["java", "spring boot", "kubernetes", "react", "postgresql"],
        experience: "6-month SDE Intern at Amazon",
        education: "B.Tech CSE — IIT Bombay (9.2 CGPA)",
        resumeScore: 95,
    },
    {
        id: "c3",
        name: "Rahul Sharma",
        email: "rahul.s@bits.edu.in",
        skills: ["python", "react", "node", "mongodb", "docker"],
        experience: "1 year Full-stack Developer at Flipkart",
        education: "M.Tech SE — BITS Pilani (8.5 CGPA)",
        resumeScore: 88,
    },
    {
        id: "c4",
        name: "Priya Krishnan",
        email: "priya.k@iitkgp.ac.in",
        skills: ["c++", "networking", "ccna", "linux", "python"],
        experience: "Network Engineering Intern at Cisco",
        education: "B.Tech ECE — IIT Kharagpur (9.0 CGPA)",
        resumeScore: 90,
    },
];

// ── Demo Jobs ──
const demoJobs = [
    {
        id: "j1",
        title: "Senior ML Engineer",
        company: "Google",
        skills: ["python", "tensorflow", "docker", "kubernetes", "machine learning"],
        positions: 5,
    },
    {
        id: "j2",
        title: "Backend Engineer",
        company: "Amazon",
        skills: ["java", "spring boot", "aws", "postgresql", "kubernetes"],
        positions: 8,
    },
    {
        id: "j3",
        title: "Full Stack Developer",
        company: "Microsoft",
        skills: ["react", "node", "typescript", "docker", "mongodb"],
        positions: 10,
    },
    {
        id: "j4",
        title: "Network Security Engineer",
        company: "Cisco",
        skills: ["ccna", "networking", "linux", "python", "c++"],
        positions: 3,
    },
];

// ── AI Match Results ──
const demoMatchResults = [
    {
        candidateId: "c1",
        candidateName: "Aarav Patel",
        jobId: "j1",
        jobTitle: "Senior ML Engineer",
        company: "Google",
        score: 0.94,
        confidence: 0.91,
        reasoning: "Strong ML stack overlap: Python, TensorFlow, Docker. 2yr TCS internship aligns with production ML requirements. AWS experience covers cloud deployment needs.",
        biasFlags: [],
        skillMatch: [
            { skill: "Python", score: 100 },
            { skill: "TensorFlow", score: 100 },
            { skill: "Docker", score: 100 },
            { skill: "Kubernetes", score: 40 },
            { skill: "ML", score: 95 },
        ],
    },
    {
        candidateId: "c2",
        candidateName: "Sneha Gupta",
        jobId: "j2",
        jobTitle: "Backend Engineer",
        company: "Amazon",
        score: 0.92,
        confidence: 0.88,
        reasoning: "Java + Spring Boot + PostgreSQL core match. Amazon internship provides domain familiarity. Kubernetes skills strengthen profile. High CGPA (9.2) from IIT Bombay.",
        biasFlags: [],
        skillMatch: [
            { skill: "Java", score: 100 },
            { skill: "Spring Boot", score: 100 },
            { skill: "AWS", score: 60 },
            { skill: "PostgreSQL", score: 100 },
            { skill: "Kubernetes", score: 100 },
        ],
    },
    {
        candidateId: "c3",
        candidateName: "Rahul Sharma",
        jobId: "j3",
        jobTitle: "Full Stack Developer",
        company: "Microsoft",
        score: 0.89,
        confidence: 0.85,
        reasoning: "Full-stack alignment: React + Node + MongoDB + Docker. 1yr Flipkart experience shows production readiness. TypeScript gap noted but easily bridged.",
        biasFlags: ["Missing TypeScript — recommended upskill"],
        skillMatch: [
            { skill: "React", score: 100 },
            { skill: "Node", score: 100 },
            { skill: "TypeScript", score: 30 },
            { skill: "Docker", score: 100 },
            { skill: "MongoDB", score: 100 },
        ],
    },
    {
        candidateId: "c4",
        candidateName: "Priya Krishnan",
        jobId: "j4",
        jobTitle: "Network Security Engineer",
        company: "Cisco",
        score: 0.96,
        confidence: 0.93,
        reasoning: "Perfect domain match: CCNA certified, networking + Linux expertise, C++ proficiency. Cisco internship gives direct domain experience. Strongest candidate.",
        biasFlags: [],
        skillMatch: [
            { skill: "CCNA", score: 100 },
            { skill: "Networking", score: 100 },
            { skill: "Linux", score: 100 },
            { skill: "Python", score: 100 },
            { skill: "C++", score: 100 },
        ],
    },
];

function scoreColor(score: number): string {
    if (score >= 0.9) return "text-emerald-400";
    if (score >= 0.75) return "text-blue-400";
    if (score >= 0.6) return "text-amber-400";
    return "text-red-400";
}

function scoreBarColor(score: number): string {
    if (score >= 0.9) return "bg-emerald-500";
    if (score >= 0.75) return "bg-blue-500";
    if (score >= 0.6) return "bg-amber-500";
    return "bg-red-500";
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
        <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur-xl p-3 shadow-xl">
            <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <p key={i} className="text-xs" style={{ color: entry.color }}>
                    {entry.name}: <span className="font-bold">{entry.value}%</span>
                </p>
            ))}
        </div>
    );
};

export default function AIMatcherPage() {
    const [selectedMatch, setSelectedMatch] = useState(demoMatchResults[0]);
    const [isMatching, setIsMatching] = useState(false);

    const handleRunMatch = () => {
        setIsMatching(true);
        setTimeout(() => setIsMatching(false), 2000);
    };

    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Sparkles className="h-8 w-8 text-primary" />
                        AI Placement Matcher
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Multi-signal AI matching engine — skills overlap, embedding similarity, LLM reasoning, and bias auditing.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm font-medium backdrop-blur-sm transition-all hover:bg-accent">
                        <Upload className="h-4 w-4" />
                        Import Resumes
                    </button>
                    <button
                        onClick={handleRunMatch}
                        disabled={isMatching}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {isMatching ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Matching...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Run AI Match
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Match Stats ── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                {[
                    { label: "Candidates", value: demoCandidates.length, icon: User, color: "text-purple-400", bg: "bg-purple-500/10" },
                    { label: "Open Positions", value: demoJobs.reduce((a, j) => a + j.positions, 0), icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Matches Found", value: demoMatchResults.length, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Avg. Score", value: (demoMatchResults.reduce((a, m) => a + m.score, 0) / demoMatchResults.length * 100).toFixed(0) + "%", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
                ].map((stat, i) => (
                    <div key={stat.label} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
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

            {/* ── Match Results + Detail ── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                {/* Match List */}
                <div className="lg:col-span-2 space-y-3">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        Match Results
                    </h2>
                    {demoMatchResults.map((match, i) => (
                        <button
                            key={`${match.candidateId}-${match.jobId}`}
                            onClick={() => setSelectedMatch(match)}
                            className={`w-full text-left glass-card p-4 transition-all duration-200 animate-fade-in hover:border-primary/30 ${selectedMatch.candidateId === match.candidateId
                                ? "ring-2 ring-primary/50 border-primary/30"
                                : ""
                                }`}
                            style={{ animationDelay: `${i * 80}ms` }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold">{match.candidateName}</span>
                                <span className={`text-lg font-bold ${scoreColor(match.score)}`}>
                                    {(match.score * 100).toFixed(0)}%
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                                → {match.jobTitle} at {match.company}
                            </div>
                            {/* Score bar */}
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${scoreBarColor(match.score)} transition-all duration-700`}
                                    style={{ width: `${match.score * 100}%` }}
                                />
                            </div>
                            {match.biasFlags.length > 0 && (
                                <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-400">
                                    <AlertTriangle className="h-3 w-3" />
                                    {match.biasFlags[0]}
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-3 glass-card p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold">{selectedMatch.candidateName}</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">
                                → {selectedMatch.jobTitle} at {selectedMatch.company}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className={`text-3xl font-bold ${scoreColor(selectedMatch.score)}`}>
                                {(selectedMatch.score * 100).toFixed(0)}%
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {(selectedMatch.confidence * 100).toFixed(0)}% confidence
                            </div>
                        </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">AI Reasoning</span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                            {selectedMatch.reasoning}
                        </p>
                    </div>

                    {/* Skill Match Radar */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3">Skill-by-Skill Analysis</h4>
                        <ResponsiveContainer width="100%" height={260}>
                            <RadarChart data={selectedMatch.skillMatch}>
                                <PolarGrid stroke="hsl(215 28% 17%)" />
                                <PolarAngleAxis dataKey="skill" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                                <PolarRadiusAxis tick={{ fill: "#6b7280", fontSize: 10 }} domain={[0, 100]} />
                                <Radar
                                    name="Match Score"
                                    dataKey="score"
                                    stroke="#a855f7"
                                    fill="#a855f7"
                                    fillOpacity={0.25}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Skill Bars */}
                    <div className="space-y-3">
                        {selectedMatch.skillMatch.map((skill) => (
                            <div key={skill.skill} className="flex items-center gap-3">
                                <span className="text-xs font-medium w-24 text-right text-muted-foreground">{skill.skill}</span>
                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${skill.score >= 80 ? "bg-emerald-500" : skill.score >= 50 ? "bg-blue-500" : "bg-amber-500"
                                            }`}
                                        style={{ width: `${skill.score}%` }}
                                    />
                                </div>
                                <span className="text-xs font-bold w-10">{skill.score}%</span>
                            </div>
                        ))}
                    </div>

                    {/* Bias Flags */}
                    {selectedMatch.biasFlags.length > 0 && (
                        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-semibold text-amber-400">Bias & Fairness Flags</span>
                            </div>
                            {selectedMatch.biasFlags.map((flag, i) => (
                                <p key={i} className="text-sm text-amber-300/80">{flag}</p>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                            <CheckCircle2 className="h-4 w-4" />
                            Approve Match
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-all hover:bg-accent">
                            Schedule Interview
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10">
                            Reject
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
