import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const mono = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Haveloc Pro — Enterprise Project & Placement Platform",
    description:
        "AI-native enterprise platform for project management, team collaboration, and placement automation. 10x faster, smarter, stress-free.",
    keywords: [
        "project management",
        "placement automation",
        "AI",
        "enterprise",
        "collaboration",
        "campus recruiting",
    ],
    openGraph: {
        title: "Haveloc Pro",
        description: "AI-Native Enterprise Project & Placement Platform",
        type: "website",
    },
};

import { Providers } from "@/components/providers";

// ... (imports remain)

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body
                className={`${inter.variable} ${mono.variable} font-sans min-h-screen`}
            >
                <Providers>
                    <div className="relative min-h-screen">
                        {/* Ambient background gradients */}
                        <div className="fixed inset-0 -z-10 overflow-hidden">
                            <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl" />
                            <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-3xl" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-violet-500/5 blur-3xl" />
                        </div>
                        {children}
                    </div>
                </Providers>
            </body>
        </html>
    );
}
