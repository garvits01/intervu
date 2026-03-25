import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";
import { Prisma, TaskStatus, TaskPriority } from "@prisma/client";

export interface CreateTaskDto {
    projectId: string;
    creatorId: string;
    assigneeId?: string;
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: Date;
    tags?: string[];
    aiGenerated?: boolean;
    aiConfidence?: number;
}

export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    dueDate?: Date;
    tags?: string[];
    estimatedHours?: number;
    actualHours?: number;
}

export interface TaskFilters {
    projectId?: string;
    assigneeId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
    page?: number;
    limit?: number;
}

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);
    private readonly CACHE_TTL = 300; // 5 minutes

    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
        private events: EventEmitter2
    ) { }

    async create(dto: CreateTaskDto) {
        const task = await this.prisma.task.create({
            data: {
                projectId: dto.projectId,
                creatorId: dto.creatorId,
                assigneeId: dto.assigneeId,
                title: dto.title,
                description: dto.description,
                priority: dto.priority || "MEDIUM",
                dueDate: dto.dueDate,
                tags: dto.tags || [],
                aiGenerated: dto.aiGenerated || false,
                aiConfidence: dto.aiConfidence,
            },
            include: {
                assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
                creator: { select: { id: true, name: true, email: true } },
            },
        });

        // Invalidate project tasks cache
        await this.redis.del(`tasks:project:${dto.projectId}`);

        // Emit event for real-time updates and notifications
        this.events.emit("task.created", {
            taskId: task.id,
            projectId: dto.projectId,
            assigneeId: dto.assigneeId,
            title: task.title,
            aiGenerated: task.aiGenerated,
        });

        this.logger.log(`Task created: ${task.id} (AI: ${task.aiGenerated})`);
        return task;
    }

    async findAll(filters: TaskFilters) {
        const { projectId, assigneeId, status, priority, search, page = 1, limit = 50 } = filters;
        const skip = (page - 1) * limit;

        const where: Prisma.TaskWhereInput = {
            ...(projectId && { projectId }),
            ...(assigneeId && { assigneeId }),
            ...(status && { status }),
            ...(priority && { priority }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
                    { description: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
                ],
            }),
        };

        const [tasks, total] = await Promise.all([
            this.prisma.task.findMany({
                where,
                include: {
                    assignee: { select: { id: true, name: true, avatarUrl: true } },
                    creator: { select: { id: true, name: true } },
                    _count: { select: { comments: true, attachments: true } },
                },
                orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
                skip,
                take: limit,
            }),
            this.prisma.task.count({ where }),
        ]);

        return {
            tasks,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id: string) {
        // Check cache first
        const cached = await this.redis.getJSON<object>(`task:${id}`);
        if (cached) return cached;

        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
                creator: { select: { id: true, name: true, email: true } },
                comments: {
                    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
                    orderBy: { createdAt: "desc" },
                    take: 20,
                },
                dependencies: { include: { blockingTask: { select: { id: true, title: true, status: true } } } },
                dependents: { include: { dependentTask: { select: { id: true, title: true, status: true } } } },
                attachments: true,
                _count: { select: { comments: true } },
            },
        });

        if (!task) throw new NotFoundException(`Task ${id} not found`);

        // Cache for 5 minutes
        await this.redis.setJSON(`task:${id}`, task, this.CACHE_TTL);
        return task;
    }

    async update(id: string, dto: UpdateTaskDto) {
        const existing = await this.prisma.task.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Task ${id} not found`);

        const task = await this.prisma.task.update({
            where: { id },
            data: dto,
            include: {
                assignee: { select: { id: true, name: true, avatarUrl: true } },
            },
        });

        // Invalidate caches
        await this.redis.del(`task:${id}`);
        await this.redis.del(`tasks:project:${existing.projectId}`);

        // Emit status change event
        if (dto.status && dto.status !== existing.status) {
            this.events.emit("task.status_changed", {
                taskId: id,
                projectId: existing.projectId,
                previousStatus: existing.status,
                newStatus: dto.status,
            });
        }

        return task;
    }

    async delete(id: string) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task) throw new NotFoundException(`Task ${id} not found`);

        await this.prisma.task.delete({ where: { id } });
        await this.redis.del(`task:${id}`);
        await this.redis.del(`tasks:project:${task.projectId}`);

        this.events.emit("task.deleted", { taskId: id, projectId: task.projectId });
        return { success: true };
    }

    async getProjectStats(projectId: string) {
        const cacheKey = `tasks:stats:${projectId}`;
        const cached = await this.redis.getJSON<object>(cacheKey);
        if (cached) return cached;

        const stats = await this.prisma.task.groupBy({
            by: ["status"],
            where: { projectId },
            _count: true,
        });

        const overdue = await this.prisma.task.count({
            where: {
                projectId,
                dueDate: { lt: new Date() },
                status: { notIn: ["DONE", "CANCELLED"] },
            },
        });

        const result = {
            byStatus: stats.reduce(
                (acc, s) => ({ ...acc, [s.status]: s._count }),
                {} as Record<string, number>
            ),
            overdue,
            total: stats.reduce((sum, s) => sum + s._count, 0),
        };

        await this.redis.setJSON(cacheKey, result, 60);
        return result;
    }
}
