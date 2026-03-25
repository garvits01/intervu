import * as React from "react";
import { cn } from "../lib/utils";
import type { LucideIcon } from "lucide-react";

export interface KPICardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    icon: LucideIcon;
    gradient: string;
    className?: string;
}

function KPICard({
    title,
    value,
    change,
    changeType = "neutral",
    icon: Icon,
    gradient,
    className,
}: KPICardProps) {
    return (
        <div
            className={cn(
                "rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                className
            )}
        >
            <div className="flex items-center justify-between mb-4">
                <div
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
                >
                    <Icon className="h-5 w-5 text-white" />
                </div>
                {change && (
                    <span
                        className={`text-xs font-medium ${changeType === "positive"
                                ? "text-emerald-400"
                                : changeType === "negative"
                                    ? "text-red-400"
                                    : "text-muted-foreground"
                            }`}
                    >
                        {change}
                    </span>
                )}
            </div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground mt-1">{title}</div>
        </div>
    );
}

export { KPICard };
