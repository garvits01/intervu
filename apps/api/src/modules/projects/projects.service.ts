import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ProjectStatus } from "@prisma/client";

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(data: { orgId: string; name: string; description?: string; startDate?: Date; endDate?: Date }) {
        return this.prisma.project.create({ data });
    }

    async findAll(orgId: string, status?: ProjectStatus) {
        return this.prisma.project.findMany({
            where: { orgId, ...(status && { status }) },
            include: { _count: { select: { tasks: true, threads: true, milestones: true } } },
            orderBy: { updatedAt: "desc" },
        });
    }

    async findById(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                tasks: { orderBy: { createdAt: "desc" }, take: 20, include: { assignee: { select: { id: true, name: true } } } },
                milestones: { orderBy: { dueDate: "asc" } },
                _count: { select: { tasks: true, threads: true } },
            },
        });
        if (!project) throw new NotFoundException(`Project ${id} not found`);
        return project;
    }

    async update(id: string, data: { name?: string; description?: string; status?: ProjectStatus }) {
        return this.prisma.project.update({ where: { id }, data });
    }

    async delete(id: string) {
        await this.prisma.project.delete({ where: { id } });
        return { success: true };
    }
}
