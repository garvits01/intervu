import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(orgId?: string) {
        if (orgId) {
            return this.prisma.user.findMany({
                where: { orgMemberships: { some: { orgId } } },
                select: { id: true, email: true, name: true, avatarUrl: true, role: true, isActive: true, lastLoginAt: true },
            });
        }
        return this.prisma.user.findMany({
            select: { id: true, email: true, name: true, avatarUrl: true, role: true, isActive: true },
        });
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                orgMemberships: { include: { org: { select: { id: true, name: true, slug: true } } } },
                candidateProfile: true,
                _count: { select: { assignedTasks: true, createdTasks: true } },
            },
        });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return user;
    }

    async updateProfile(id: string, data: { name?: string; avatarUrl?: string }) {
        return this.prisma.user.update({ where: { id }, data });
    }
}
