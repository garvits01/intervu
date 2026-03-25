import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../../redis/redis.service";
import { DriveStatus } from "@prisma/client";

export interface CreateDriveDto {
    orgId: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
}

export interface MatchRequestDto {
    driveId: string;
    jobIds?: string[];
    candidateIds?: string[];
    threshold?: number;
}

@Injectable()
export class PlacementsService {
    private readonly logger = new Logger(PlacementsService.name);

    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
        private events: EventEmitter2,
        private config: ConfigService
    ) { }

    // ── Drive Management ──

    async createDrive(dto: CreateDriveDto) {
        const drive = await this.prisma.placementDrive.create({
            data: {
                orgId: dto.orgId,
                title: dto.title,
                description: dto.description,
                startDate: dto.startDate,
                endDate: dto.endDate,
                status: "DRAFT",
            },
        });

        this.events.emit("placement.drive_created", { driveId: drive.id });
        this.logger.log(`Drive created: ${drive.id} - ${drive.title}`);
        return drive;
    }

    async listDrives(orgId: string, status?: DriveStatus) {
        return this.prisma.placementDrive.findMany({
            where: { orgId, ...(status && { status }) },
            include: {
                _count: {
                    select: { registrations: true, jobs: true, matchResults: true },
                },
            },
            orderBy: { startDate: "desc" },
        });
    }

    async getDrive(id: string) {
        const drive = await this.prisma.placementDrive.findUnique({
            where: { id },
            include: {
                jobs: true,
                registrations: {
                    include: { candidate: { include: { user: { select: { name: true, email: true } } } } },
                },
                matchResults: {
                    include: {
                        job: { select: { id: true, title: true, company: true } },
                        candidate: {
                            include: { user: { select: { name: true, email: true } } },
                        },
                    },
                    orderBy: { score: "desc" },
                },
                _count: { select: { registrations: true, matchResults: true } },
            },
        });

        if (!drive) throw new NotFoundException(`Drive ${id} not found`);
        return drive;
    }

    async updateDriveStatus(id: string, status: DriveStatus) {
        const drive = await this.prisma.placementDrive.update({
            where: { id },
            data: { status },
        });

        this.events.emit("placement.drive_status_changed", {
            driveId: id,
            status,
        });

        return drive;
    }

    // ── Candidate Registration ──

    async registerCandidate(driveId: string, candidateId: string) {
        const registration = await this.prisma.driveRegistration.create({
            data: { driveId, candidateId, status: "REGISTERED" },
        });

        this.events.emit("placement.candidate_registered", {
            driveId,
            candidateId,
        });

        return registration;
    }

    // ── AI Matching ──

    async triggerMatchingAI(dto: MatchRequestDto) {
        const aiServiceUrl = this.config.get<string>("AI_SERVICE_URL", "http://localhost:8000");

        // Fetch candidates and jobs for the drive
        const drive = await this.prisma.placementDrive.findUnique({
            where: { id: dto.driveId },
            include: {
                jobs: true,
                registrations: {
                    include: {
                        candidate: true,
                    },
                },
            },
        });

        if (!drive) throw new NotFoundException(`Drive ${dto.driveId} not found`);

        // Call AI service for matching
        try {
            const response = await fetch(`${aiServiceUrl}/match`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    drive_id: dto.driveId,
                    candidates: drive.registrations.map((r) => ({
                        id: r.candidate.id,
                        skills: r.candidate.parsedSkills,
                        education: r.candidate.education,
                        experience: r.candidate.experience,
                        embedding: r.candidate.embedding,
                    })),
                    jobs: drive.jobs.map((j) => ({
                        id: j.id,
                        title: j.title,
                        requirements: j.requirements,
                        skills: j.skills,
                        embedding: j.embedding,
                    })),
                    threshold: dto.threshold || 0.6,
                }),
            });

            const matchResults = await response.json();

            // Store match results
            if (matchResults.matches && Array.isArray(matchResults.matches)) {
                for (const match of matchResults.matches) {
                    await this.prisma.matchResult.upsert({
                        where: {
                            driveId_jobId_candidateId: {
                                driveId: dto.driveId,
                                jobId: match.job_id,
                                candidateId: match.candidate_id,
                            },
                        },
                        update: {
                            score: match.score,
                            confidence: match.confidence,
                            reasoning: match.reasoning,
                            biasFlags: match.bias_flags || [],
                        },
                        create: {
                            driveId: dto.driveId,
                            jobId: match.job_id,
                            candidateId: match.candidate_id,
                            score: match.score,
                            confidence: match.confidence,
                            reasoning: match.reasoning,
                            biasFlags: match.bias_flags || [],
                            status: "PENDING",
                        },
                    });
                }
            }

            this.events.emit("placement.matching_complete", {
                driveId: dto.driveId,
                matchCount: matchResults.matches?.length || 0,
            });

            this.logger.log(
                `AI matching complete for drive ${dto.driveId}: ${matchResults.matches?.length || 0} matches`
            );

            return {
                driveId: dto.driveId,
                matchCount: matchResults.matches?.length || 0,
                matches: matchResults.matches,
            };
        } catch (error) {
            this.logger.error(`AI matching failed for drive ${dto.driveId}:`, error);
            throw error;
        }
    }

    // ── Analytics ──

    async getDriveStats(driveId: string) {
        const cacheKey = `placement:stats:${driveId}`;
        const cached = await this.redis.getJSON<object>(cacheKey);
        if (cached) return cached;

        const [registrations, matches, selections] = await Promise.all([
            this.prisma.driveRegistration.count({ where: { driveId } }),
            this.prisma.matchResult.count({ where: { driveId } }),
            this.prisma.matchResult.count({ where: { driveId, status: "APPROVED" } }),
        ]);

        const avgScore = await this.prisma.matchResult.aggregate({
            where: { driveId },
            _avg: { score: true },
        });

        const stats = {
            registrations,
            matches,
            selections,
            averageMatchScore: avgScore._avg.score || 0,
            conversionRate: registrations > 0 ? (selections / registrations) * 100 : 0,
        };

        await this.redis.setJSON(cacheKey, stats, 120);
        return stats;
    }
}
