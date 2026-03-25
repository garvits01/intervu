import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";

@Injectable()
export class AnalyticsService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService
    ) { }

    async getOrgDashboard(orgId: string) {
        const cacheKey = `analytics:dashboard:${orgId}`;
        const cached = await this.redis.getJSON<object>(cacheKey);
        if (cached) return cached;

        const [projects, tasks, placements, users] = await Promise.all([
            this.prisma.project.count({ where: { orgId } }),
            this.prisma.task.count({ where: { project: { orgId } } }),
            this.prisma.matchResult.count({
                where: { drive: { orgId }, status: "APPROVED" },
            }),
            this.prisma.orgMembership.count({ where: { orgId } }),
        ]);

        const tasksByStatus = await this.prisma.task.groupBy({
            by: ["status"],
            where: { project: { orgId } },
            _count: true,
        });

        const recentActivity = await this.prisma.activityLog.findMany({
            where: { user: { orgMemberships: { some: { orgId } } } },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: { user: { select: { name: true, avatarUrl: true } } },
        });

        const dashboard = {
            summary: { projects, tasks, placements, users },
            tasksByStatus: tasksByStatus.reduce(
                (acc, item) => ({ ...acc, [item.status]: item._count }),
                {} as Record<string, number>
            ),
            recentActivity,
        };

        await this.redis.setJSON(cacheKey, dashboard, 60);
        return dashboard;
    }

    async getPlacementReport(orgId: string, dateRange?: { from: Date; to: Date }) {
        const where = {
            drive: {
                orgId,
                ...(dateRange && {
                    startDate: { gte: dateRange.from },
                    endDate: { lte: dateRange.to },
                }),
            },
        };

        const [totalMatches, approved, avgScore] = await Promise.all([
            this.prisma.matchResult.count({ where }),
            this.prisma.matchResult.count({ where: { ...where, status: "APPROVED" } }),
            this.prisma.matchResult.aggregate({ where, _avg: { score: true, confidence: true } }),
        ]);

        return {
            totalMatches,
            approved,
            rejected: totalMatches - approved,
            avgMatchScore: avgScore._avg.score || 0,
            avgConfidence: avgScore._avg.confidence || 0,
            approvalRate: totalMatches > 0 ? (approved / totalMatches) * 100 : 0,
        };
    }
}
