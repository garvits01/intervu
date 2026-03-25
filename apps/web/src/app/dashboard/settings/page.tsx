"use client";

import { useState } from "react";
import {
    Settings,
    User,
    Shield,
    Bell,
    Palette,
    Globe,
    Key,
    Database,
    Save,
    Moon,
    Sun,
} from "lucide-react";

const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "api", label: "API Keys", icon: Key },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account, security, and platform preferences.</p>
            </div>

            <div className="flex gap-6">
                {/* Tabs */}
                <div className="w-56 flex-shrink-0 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 glass-card p-8">
                    {activeTab === "profile" && (
                        <div className="space-y-6 max-w-lg">
                            <h2 className="text-lg font-semibold">Profile Settings</h2>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white">P</div>
                                <div>
                                    <div className="font-semibold">Priya Sharma</div>
                                    <div className="text-sm text-muted-foreground">Admin • priya@haveloc.pro</div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Full Name</label>
                                    <input type="text" className="input-field" defaultValue="Priya Sharma" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                                    <input type="email" className="input-field" defaultValue="priya@haveloc.pro" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Role</label>
                                    <select className="input-field">
                                        <option>Admin</option>
                                        <option>Manager</option>
                                        <option>Member</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Organization</label>
                                    <input type="text" className="input-field" defaultValue="Haveloc Pro Inc." />
                                </div>
                            </div>
                            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                                <Save className="h-4 w-4" /> Save Changes
                            </button>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="space-y-6 max-w-lg">
                            <h2 className="text-lg font-semibold">Security</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Current Password</label>
                                    <input type="password" className="input-field" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">New Password</label>
                                    <input type="password" className="input-field" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
                                    <input type="password" className="input-field" placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="glass-card p-4 bg-emerald-500/5 border-emerald-500/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <Shield className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm font-semibold text-emerald-400">Two-Factor Authentication</span>
                                </div>
                                <p className="text-xs text-muted-foreground">2FA is enabled via authenticator app.</p>
                            </div>
                            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                                <Save className="h-4 w-4" /> Update Password
                            </button>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="space-y-6 max-w-lg">
                            <h2 className="text-lg font-semibold">Notification Preferences</h2>
                            {[
                                { label: "Email notifications", desc: "Receive email for important events", default: true },
                                { label: "AI agent alerts", desc: "Get notified when AI generates tasks or detects risks", default: true },
                                { label: "Placement updates", desc: "Candidate status changes and drive events", default: true },
                                { label: "Weekly digest", desc: "Summary of weekly activity and metrics", default: false },
                                { label: "Slack integration", desc: "Push notifications to connected Slack channels", default: true },
                            ].map(pref => (
                                <div key={pref.label} className="flex items-center justify-between py-3 border-b border-border/30">
                                    <div>
                                        <div className="text-sm font-medium">{pref.label}</div>
                                        <div className="text-xs text-muted-foreground">{pref.desc}</div>
                                    </div>
                                    <label className="relative inline-flex cursor-pointer">
                                        <input type="checkbox" defaultChecked={pref.default} className="sr-only peer" />
                                        <div className="w-10 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "appearance" && (
                        <div className="space-y-6 max-w-lg">
                            <h2 className="text-lg font-semibold">Appearance</h2>
                            <div>
                                <label className="text-sm font-medium mb-3 block">Theme</label>
                                <div className="flex gap-3">
                                    {[
                                        { label: "Dark", icon: Moon, active: true },
                                        { label: "Light", icon: Sun, active: false },
                                        { label: "System", icon: Globe, active: false },
                                    ].map(theme => (
                                        <button
                                            key={theme.label}
                                            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all ${theme.active ? "bg-primary text-primary-foreground shadow-lg" : "border border-border bg-card/50 text-muted-foreground hover:bg-accent"}`}
                                        >
                                            <theme.icon className="h-4 w-4" />
                                            {theme.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1.5 block">Accent Color</label>
                                <div className="flex gap-2">
                                    {["bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"].map(color => (
                                        <button key={color} className={`h-8 w-8 rounded-full ${color} ring-2 ${color === "bg-purple-500" ? "ring-white ring-offset-2 ring-offset-background" : "ring-transparent"} transition-all hover:scale-110`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "api" && (
                        <div className="space-y-6 max-w-lg">
                            <h2 className="text-lg font-semibold">API Keys</h2>
                            <p className="text-sm text-muted-foreground">Manage API keys for programmatic access to Haveloc Pro.</p>
                            <div className="space-y-3">
                                {[
                                    { name: "Production Key", created: "Jan 15, 2026", lastUsed: "2 hours ago", prefix: "hvlc_prod_****8f3a" },
                                    { name: "Development Key", created: "Feb 1, 2026", lastUsed: "5 mins ago", prefix: "hvlc_dev_****2c1b" },
                                ].map(key => (
                                    <div key={key.name} className="rounded-xl border border-border/50 bg-card/50 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold">{key.name}</span>
                                            <button className="text-xs text-destructive hover:underline">Revoke</button>
                                        </div>
                                        <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{key.prefix}</code>
                                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                            <span>Created: {key.created}</span>
                                            <span>Last used: {key.lastUsed}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
                                <Key className="h-4 w-4" /> Generate New Key
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
