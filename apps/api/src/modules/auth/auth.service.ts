import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    orgId?: string;
}

import { User } from "@prisma/client";

export interface AuthResponse {
    user: User;
    tokens: AuthTokens;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    private verifyPassword(password: string, hash: string): boolean {
        // Check for scrypt format (salt:hash) used in seed
        if (hash.includes(":")) {
            const [salt, key] = hash.split(":");
            const verifyHash = crypto.scryptSync(password, salt, 64).toString("hex");
            return key === verifyHash;
        }
        // Fallback to bcrypt
        return bcrypt.compareSync(password, hash);
    }

    async validateUser(id: string): Promise<JwtPayload> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                orgMemberships: { take: 1, orderBy: { joinedAt: "desc" } },
            },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException("User not found or inactive");
        }

        return {
            sub: user.id,
            email: user.email,
            role: user.role,
            orgId: user.orgMemberships[0]?.orgId,
        };
    }

    async generateTokens(payload: JwtPayload): Promise<AuthTokens> {
        const accessToken = this.jwtService.sign(payload, { expiresIn: "1h" });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

        this.logger.debug(`Tokens generated for user ${payload.sub}`);

        return {
            accessToken,
            refreshToken,
            expiresIn: 3600,
        };
    }

    async refreshTokens(refreshToken: string): Promise<AuthTokens> {
        try {
            const payload = this.jwtService.verify<JwtPayload>(refreshToken);
            return this.generateTokens({
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
                orgId: payload.orgId,
            });
        } catch {
            throw new UnauthorizedException("Invalid refresh token");
        }
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: {
                orgMemberships: { take: 1, orderBy: { joinedAt: "desc" } },
            },
        });

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // Verify password
        if (!user.password || !this.verifyPassword(password, user.password)) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate tokens
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            orgId: user.orgMemberships[0]?.orgId,
        };

        const tokens = await this.generateTokens(payload);
        return { user, tokens };
    }

    async register(email: string, password: string, name: string): Promise<AuthResponse> {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new UnauthorizedException("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: "MEMBER",
            },
        });

        // Create default organization if needed, or join one. For now, just create user.
        // We might want to create a default org for them.
        const org = await this.prisma.organization.create({
            data: {
                name: `${name}'s Organization`,
                slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
                plan: "FREE",
            },
        });

        await this.prisma.orgMembership.create({
            data: {
                userId: user.id,
                orgId: org.id,
                role: "OWNER",
            },
        });

        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            orgId: org.id,
        };

        const tokens = await this.generateTokens(payload);
        return { user, tokens };
    }
}
