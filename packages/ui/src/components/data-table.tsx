import * as React from "react";
import { cn } from "../lib/utils";

export interface Column<T> {
    key: string;
    header: string;
    render?: (row: T) => React.ReactNode;
    className?: string;
    align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (row: T) => string;
    className?: string;
    onRowClick?: (row: T) => void;
    emptyMessage?: string;
}

function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    keyExtractor,
    className,
    onRowClick,
    emptyMessage = "No data found.",
}: DataTableProps<T>) {
    const alignClass = (align?: string) => {
        switch (align) {
            case "center":
                return "text-center";
            case "right":
                return "text-right";
            default:
                return "text-left";
        }
    };

    return (
        <div
            className={cn(
                "rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg overflow-hidden",
                className
            )}
        >
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/50">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={cn(
                                        "px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                                        alignClass(col.align),
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-12 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, idx) => (
                                <tr
                                    key={keyExtractor(row)}
                                    className={cn(
                                        "transition-colors animate-fade-in",
                                        onRowClick
                                            ? "cursor-pointer hover:bg-accent/30"
                                            : "hover:bg-accent/20"
                                    )}
                                    style={{ animationDelay: `${idx * 40}ms` }}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={cn(
                                                "px-6 py-4 text-sm",
                                                alignClass(col.align),
                                                col.className
                                            )}
                                        >
                                            {col.render
                                                ? col.render(row)
                                                : (row[col.key] as React.ReactNode)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export { DataTable };
