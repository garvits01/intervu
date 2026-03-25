import Link from "next/link";
import {
    ArrowRight,
    Sparkles,
    Zap,
    Shield,
    BarChart3,
    Users,
    Globe,
} from "lucide-react";

const features = [
    {
        icon: Sparkles,
        title: "AI-Powered Placement Matching",
        description:
            "NLP resume parsing and ML-driven candidate-job matching with confidence scores and bias audits.",
        gradient: "from-purple-500 to-violet-600",
    },
    {
        icon: Zap,
        title: "Predictive Task Intelligence",
        description:
            "AI auto-generates tasks from meetings, forecasts delays, and auto-unblocks dependencies.",
        gradient: "from-amber-500 to-orange-600",
    },
    {
        icon: BarChart3,
        title: "Real-Time Analytics",
        description:
            "ML-powered forecasting dashboards with actionable insights and automated reports.",
        gradient: "from-cyan-500 to-blue-600",
    },
    {
        icon: Users,
        title: "Multiplayer Collaboration",
        description:
            "Topic-based threads, AI summaries, voice-to-task, and real-time presence.",
        gradient: "from-emerald-500 to-green-600",
    },
    {
        icon: Shield,
        title: "Enterprise Security",
        description:
            "Zero-trust architecture, SOC 2 Type II, GDPR/CCPA, end-to-end encryption.",
        gradient: "from-rose-500 to-red-600",
    },
    {
        icon: Globe,
        title: "Global Scale",
        description:
            "Multi-region, multi-tenant SaaS serving 1M+ concurrent users with 99.99% uptime.",
        gradient: "from-indigo-500 to-purple-600",
    },
];

const stats = [
    { value: "10x", label: "Faster Placements" },
    { value: "1M+", label: "Concurrent Users" },
    { value: "99.99%", label: "Uptime SLA" },
    { value: "1000+", label: "Integrations" },
];

export default function HomePage() {
    return (
        <main className="relative">
            {/* ── Hero Section ── */}
            <section className="relative px-6 pt-24 pb-20 lg:pt-32 lg:pb-28">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col items-center text-center">
                        {/* Badge */}
                        <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
                            <Sparkles className="h-4 w-4" />
                            <span>AI-Native Enterprise Platform</span>
                        </div>

                        {/* Heading */}
                        <h1 className="animate-fade-in max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                            Projects & Placements,{" "}
                            <span className="gradient-text">Reimagined with AI</span>
                        </h1>

                        {/* Subheading */}
                        <p className="animate-fade-in animate-delay-100 mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
                            Haveloc Pro is the enterprise platform that makes every team and
                            placement process 10x faster, smarter, and stress-free — powered
                            by AI that anticipates what you need before you ask.
                        </p>

                        {/* CTAs */}
                        <div className="animate-fade-in animate-delay-200 mt-10 flex flex-col gap-4 sm:flex-row">
                            <Link
                                href="/dashboard"
                                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
                            >
                                Open Dashboard
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/placements"
                                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-8 py-4 text-base font-semibold backdrop-blur-sm transition-all duration-300 hover:bg-accent hover:-translate-y-0.5"
                            >
                                Placement Automation
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Stats Bar ── */}
            <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                        {stats.map((stat, i) => (
                            <div
                                key={stat.label}
                                className="animate-fade-in text-center"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div className="text-3xl font-bold gradient-text sm:text-4xl">
                                    {stat.value}
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features Grid ── */}
            <section className="px-6 py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold sm:text-4xl">
                            Everything You Need,{" "}
                            <span className="gradient-text">Intelligently Connected</span>
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            From AI-powered placements to predictive project management —
                            every feature works together to deliver measurable outcomes.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, i) => (
                            <div
                                key={feature.title}
                                className="group glass-card p-8 hover-lift animate-fade-in"
                                style={{ animationDelay: `${i * 100}ms` }}
                            >
                                <div
                                    className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg mb-5`}
                                >
                                    <feature.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Section ── */}
            <section className="px-6 py-24">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="glass-card p-12 lg:p-16 relative overflow-hidden">
                        <div className="absolute inset-0 bg-hero-gradient opacity-5" />
                        <div className="relative">
                            <h2 className="text-3xl font-bold sm:text-4xl">
                                Ready to Transform Your Workflow?
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Join the next generation of enterprise project management and
                                placement automation.
                            </p>
                            <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
                                <Link
                                    href="/dashboard"
                                    className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    Get Started Free
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-6 py-12">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-bold">Haveloc Pro</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2026 Haveloc Pro. Enterprise-grade AI platform.
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
