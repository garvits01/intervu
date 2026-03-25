// Haveloc Pro — Database Seed Script
// Run: npx ts-node prisma/seed.ts

import { PrismaClient, UserRole, ProjectStatus, TaskStatus, TaskPriority, DriveStatus, JobType, RegistrationStatus, MatchStatus, NotificationType, TemplateCategory } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

// Simple password hash (bcrypt-like, using scrypt for Node.js built-in)
function hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

async function main() {
    console.log("🌱 Seeding Haveloc Pro database...\n");

    // ── Clean ──
    await prisma.activityLog.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.matchResult.deleteMany();
    await prisma.driveRegistration.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.taskDependency.deleteMany();
    await prisma.task.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.thread.deleteMany();
    await prisma.job.deleteMany();
    await prisma.placementDrive.deleteMany();
    await prisma.template.deleteMany();
    await prisma.integration.deleteMany();
    await prisma.candidateProfile.deleteMany();
    await prisma.orgMembership.deleteMany();
    await prisma.project.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
    console.log("  ✓ Cleaned existing data");

    // ── Organization ──
    const org = await prisma.organization.create({
        data: {
            name: "Haveloc Engineering",
            slug: "haveloc-eng",
            domain: "haveloc.pro",
            plan: "PROFESSIONAL",
        },
    });
    console.log("  ✓ Organization created");

    // ── Users ──
    const adminUser = await prisma.user.create({
        data: {
            email: "admin@haveloc.pro",
            name: "Priya Sharma",
            password: hashPassword("admin123"),
            role: UserRole.ADMIN,
            avatarUrl: null,
        },
    });

    const memberUser = await prisma.user.create({
        data: {
            email: "marcus@haveloc.pro",
            name: "Marcus Davis",
            password: hashPassword("marcus123"),
            role: UserRole.MEMBER,
        },
    });

    const davidUser = await prisma.user.create({
        data: {
            email: "david@haveloc.pro",
            name: "David Kim",
            password: hashPassword("david123"),
            role: UserRole.MEMBER,
        },
    });

    const sarahUser = await prisma.user.create({
        data: {
            email: "sarah@haveloc.pro",
            name: "Sarah Lee",
            password: hashPassword("sarah123"),
            role: UserRole.MEMBER,
        },
    });

    const users = [adminUser, memberUser, davidUser, sarahUser];
    console.log(`  ✓ ${users.length} users created`);

    // ── Org Memberships ──
    for (const user of users) {
        await prisma.orgMembership.create({
            data: {
                userId: user.id,
                orgId: org.id,
                role: user.role === UserRole.ADMIN ? "ADMIN" : "MEMBER",
            },
        });
    }
    console.log("  ✓ Org memberships created");

    // ── Candidate Users + Profiles ──
    const candidateData = [
        { name: "Aarav Patel", email: "aarav.p@srmist.edu.in", skills: ["Python", "ML", "TensorFlow", "Docker"], education: [{ degree: "B.Tech CSE", institution: "SRMIST", year: 2026, cgpa: 8.9 }] },
        { name: "Sneha Gupta", email: "sneha.g@iitb.ac.in", skills: ["Java", "Spring Boot", "Kubernetes", "React"], education: [{ degree: "B.Tech CSE", institution: "IIT Bombay", year: 2026, cgpa: 9.2 }] },
        { name: "Rahul Sharma", email: "rahul.s@bits.edu.in", skills: ["React", "Node.js", "MongoDB", "Docker"], education: [{ degree: "B.Tech CSE", institution: "BITS Pilani", year: 2026, cgpa: 8.5 }] },
        { name: "Priya Krishnan", email: "priya.k@iitkgp.ac.in", skills: ["C++", "Networking", "CCNA", "Linux"], education: [{ degree: "B.Tech ECE", institution: "IIT Kharagpur", year: 2026, cgpa: 9.0 }] },
        { name: "Arjun Mehta", email: "arjun.m@vit.edu.in", skills: ["Python", "Django", "AWS", "PostgreSQL"], education: [{ degree: "B.Tech CSE", institution: "VIT", year: 2026, cgpa: 8.3 }] },
        { name: "Rohan Das", email: "rohan.d@iitd.ac.in", skills: ["ML", "PyTorch", "Go", "Kubernetes"], education: [{ degree: "B.Tech CSE", institution: "IIT Delhi", year: 2026, cgpa: 9.4 }] },
        { name: "Ananya Singh", email: "ananya.s@iisc.ac.in", skills: ["NLP", "Transformers", "Python", "FastAPI"], education: [{ degree: "M.Tech AI", institution: "IISc Bangalore", year: 2026, cgpa: 9.1 }] },
        { name: "Kavya Reddy", email: "kavya.r@nit.edu.in", skills: ["Embedded", "VHDL", "Python", "IoT"], education: [{ degree: "B.Tech ECE", institution: "NIT Warangal", year: 2026, cgpa: 8.7 }] },
    ];

    const candidateProfiles = [];
    for (const c of candidateData) {
        const user = await prisma.user.create({
            data: {
                email: c.email,
                name: c.name,
                password: hashPassword("candidate123"),
                role: UserRole.VIEWER,
            },
        });
        const profile = await prisma.candidateProfile.create({
            data: {
                userId: user.id,
                parsedSkills: c.skills,
                education: c.education,
                experience: [],
                parsedData: { skills: c.skills, education: c.education },
            },
        });
        candidateProfiles.push(profile);
    }
    console.log(`  ✓ ${candidateProfiles.length} candidate profiles created`);

    // ── Projects ──
    const projects = await Promise.all([
        prisma.project.create({
            data: {
                orgId: org.id,
                name: "Campus Recruiting Q1 2026",
                description: "End-to-end campus placement management for Q1 2026 season.",
                status: ProjectStatus.ACTIVE,
                startDate: new Date("2026-01-01"),
                endDate: new Date("2026-03-31"),
            },
        }),
        prisma.project.create({
            data: {
                orgId: org.id,
                name: "Google SDE Intern Drive",
                description: "Google campus internship drive for SDE positions.",
                status: ProjectStatus.ACTIVE,
                startDate: new Date("2026-02-01"),
                endDate: new Date("2026-03-25"),
            },
        }),
        prisma.project.create({
            data: {
                orgId: org.id,
                name: "Amazon SDE-1 Placements",
                description: "Amazon full-time SDE-1 hiring from top colleges.",
                status: ProjectStatus.ACTIVE,
                startDate: new Date("2026-01-15"),
                endDate: new Date("2026-02-28"),
            },
        }),
        prisma.project.create({
            data: {
                orgId: org.id,
                name: "AI Platform v2.0",
                description: "Upgrade AI matching engine with new transformer models.",
                status: ProjectStatus.ACTIVE,
                startDate: new Date("2026-02-01"),
                endDate: new Date("2026-04-15"),
            },
        }),
        prisma.project.create({
            data: {
                orgId: org.id,
                name: "Microsoft Engage Program",
                description: "Microsoft Engage campus mentorship and hiring program.",
                status: ProjectStatus.COMPLETED,
                startDate: new Date("2025-12-01"),
                endDate: new Date("2026-02-05"),
            },
        }),
    ]);
    console.log(`  ✓ ${projects.length} projects created`);

    // ── Tasks ──
    const taskData = [
        { title: "Review placement drive applications for TechCorp", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, assigneeId: adminUser.id, projectIdx: 0, aiGenerated: true, dueDate: new Date("2026-02-18") },
        { title: "Finalize interview panel for Google campus visit", status: TaskStatus.TODO, priority: TaskPriority.CRITICAL, assigneeId: memberUser.id, projectIdx: 1, aiGenerated: false, dueDate: new Date("2026-02-19") },
        { title: "Send reminder emails to unregistered candidates", status: TaskStatus.DONE, priority: TaskPriority.MEDIUM, assigneeId: adminUser.id, projectIdx: 0, aiGenerated: true, dueDate: new Date("2026-02-16") },
        { title: "Update resume parsing model with new training data", status: TaskStatus.IN_REVIEW, priority: TaskPriority.HIGH, assigneeId: davidUser.id, projectIdx: 3, aiGenerated: false, dueDate: new Date("2026-02-20") },
        { title: "Generate weekly placement analytics report", status: TaskStatus.TODO, priority: TaskPriority.LOW, assigneeId: adminUser.id, projectIdx: 3, aiGenerated: true, dueDate: new Date("2026-02-21") },
        { title: "Setup coding assessment platform for Amazon drive", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, assigneeId: sarahUser.id, projectIdx: 2, aiGenerated: false, dueDate: new Date("2026-02-22") },
        { title: "Auto-schedule interviews based on availability", status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, assigneeId: adminUser.id, projectIdx: 0, aiGenerated: true, dueDate: new Date("2026-02-23") },
        { title: "Prepare JD templates for Microsoft Engage", status: TaskStatus.DONE, priority: TaskPriority.MEDIUM, assigneeId: adminUser.id, projectIdx: 4, aiGenerated: false, dueDate: new Date("2026-02-15") },
        { title: "Review bias audit results for AI matcher", status: TaskStatus.IN_REVIEW, priority: TaskPriority.CRITICAL, assigneeId: davidUser.id, projectIdx: 3, aiGenerated: true, dueDate: new Date("2026-02-24") },
        { title: "Configure webhook notifications for placement events", status: TaskStatus.TODO, priority: TaskPriority.LOW, assigneeId: memberUser.id, projectIdx: 3, aiGenerated: false, dueDate: new Date("2026-02-25") },
    ];

    for (const t of taskData) {
        await prisma.task.create({
            data: {
                projectId: projects[t.projectIdx].id,
                creatorId: adminUser.id,
                assigneeId: t.assigneeId,
                title: t.title,
                status: t.status,
                priority: t.priority,
                aiGenerated: t.aiGenerated,
                dueDate: t.dueDate,
            },
        });
    }
    console.log(`  ✓ ${taskData.length} tasks created`);

    // ── Placement Drives ──
    const drives = await Promise.all([
        prisma.placementDrive.create({
            data: {
                orgId: org.id,
                title: "TechCorp Campus Hiring 2026",
                description: "Full-stack developer positions across India.",
                status: DriveStatus.IN_PROGRESS,
                startDate: new Date("2026-02-10"),
                endDate: new Date("2026-03-15"),
            },
        }),
        prisma.placementDrive.create({
            data: {
                orgId: org.id,
                title: "Google SDE Intern 2026",
                description: "Summer internship for penultimate year students.",
                status: DriveStatus.REGISTRATION_OPEN,
                startDate: new Date("2026-02-20"),
                endDate: new Date("2026-04-01"),
            },
        }),
        prisma.placementDrive.create({
            data: {
                orgId: org.id,
                title: "Amazon SDE-1 Full-Time",
                description: "Entry-level SDE positions at Amazon India.",
                status: DriveStatus.COMPLETED,
                startDate: new Date("2026-01-15"),
                endDate: new Date("2026-02-10"),
            },
        }),
    ]);
    console.log(`  ✓ ${drives.length} placement drives created`);

    // ── Jobs ──
    const jobs = await Promise.all([
        prisma.job.create({
            data: {
                orgId: org.id,
                driveId: drives[0].id,
                title: "Full-Stack Developer",
                company: "TechCorp",
                description: "Build scalable web applications using React and Node.js",
                requirements: ["2+ years React", "Node.js", "PostgreSQL"],
                skills: ["React", "Node.js", "TypeScript", "Docker", "PostgreSQL"],
                location: "Bangalore, India",
                salary: "₹18-24 LPA",
                jobType: JobType.FULL_TIME,
                openPositions: 15,
            },
        }),
        prisma.job.create({
            data: {
                orgId: org.id,
                driveId: drives[1].id,
                title: "SDE Intern",
                company: "Google",
                description: "Work on large-scale distributed systems at Google",
                requirements: ["Strong CS fundamentals", "Python or C++", "Algorithms"],
                skills: ["Python", "C++", "Algorithms", "Distributed Systems", "ML"],
                location: "Bangalore / Hyderabad",
                salary: "₹1.2L/month stipend",
                jobType: JobType.INTERNSHIP,
                openPositions: 30,
            },
        }),
        prisma.job.create({
            data: {
                orgId: org.id,
                driveId: drives[2].id,
                title: "SDE-1",
                company: "Amazon",
                description: "Build and scale services that impact millions of customers",
                requirements: ["B.Tech/M.Tech", "Data Structures", "System Design"],
                skills: ["Java", "AWS", "Microservices", "Spring Boot", "DynamoDB"],
                location: "Hyderabad, India",
                salary: "₹24-30 LPA",
                jobType: JobType.FULL_TIME,
                openPositions: 20,
            },
        }),
    ]);
    console.log(`  ✓ ${jobs.length} jobs created`);

    // ── Drive Registrations ──
    for (let i = 0; i < candidateProfiles.length; i++) {
        const driveIdx = i % drives.length;
        await prisma.driveRegistration.create({
            data: {
                driveId: drives[driveIdx].id,
                candidateId: candidateProfiles[i].id,
                status: RegistrationStatus.REGISTERED,
            },
        });
    }
    console.log("  ✓ Drive registrations created");

    // ── Match Results ──
    const matchScores = [0.94, 0.92, 0.89, 0.96, 0.85, 0.97, 0.93, 0.78];
    for (let i = 0; i < candidateProfiles.length; i++) {
        const driveIdx = i % drives.length;
        const jobIdx = i % jobs.length;
        await prisma.matchResult.create({
            data: {
                driveId: drives[driveIdx].id,
                jobId: jobs[jobIdx].id,
                candidateId: candidateProfiles[i].id,
                score: matchScores[i],
                confidence: matchScores[i] - 0.05,
                reasoning: `Strong alignment in ${candidateData[i].skills.slice(0, 2).join(", ")}. Candidate shows exceptional problem-solving ability.`,
                biasFlags: matchScores[i] < 0.85 ? [{ type: "NON_CS_BACKGROUND", severity: "LOW" }] : [],
                status: matchScores[i] > 0.9 ? MatchStatus.APPROVED : MatchStatus.PENDING,
            },
        });
    }
    console.log("  ✓ AI match results created");

    // ── Threads ──
    await prisma.thread.create({
        data: {
            projectId: projects[0].id,
            title: "Sprint Planning — Campus Q1 2026",
            topic: "sprint-planning",
            isPinned: true,
            aiSummary: "Discussed sprint goals: finalize Google panel, review 342 TechCorp applications, and set up Amazon assessment platform.",
        },
    });
    await prisma.thread.create({
        data: {
            projectId: projects[3].id,
            title: "AI Matcher v2 — Bias audit results",
            topic: "technical",
            isPinned: true,
            aiSummary: "Bias audit shows 2.3% gender disparity in skill scoring. Proposed recalibration of embedding weights.",
        },
    });
    await prisma.thread.create({
        data: {
            projectId: projects[1].id,
            title: "Google campus visit logistics",
            topic: "logistics",
            isPinned: false,
        },
    });
    console.log("  ✓ Threads created");

    // ── Notifications ──
    const notifData = [
        { type: NotificationType.AI_INSIGHT, title: "3 tasks auto-generated from standup", body: "AI detected action items and created tasks for Campus Q1 project." },
        { type: NotificationType.TASK_OVERDUE, title: "Delay risk: SRM Placement Drive", body: "Sprint 4 velocity is 15% below target." },
        { type: NotificationType.PLACEMENT_UPDATE, title: "28 new placements confirmed", body: "Amazon SDE-1 drive completed with 28 successful placements." },
        { type: NotificationType.SYSTEM, title: "Marcus D. joined Google Drive project", body: "New team member added." },
        { type: NotificationType.COMMENT_ADDED, title: "New reply in: AI Matcher v2 bias audit", body: "David K. replied about recalibration results." },
    ];
    for (const n of notifData) {
        await prisma.notification.create({
            data: { userId: adminUser.id, type: n.type, title: n.title, body: n.body },
        });
    }
    console.log("  ✓ Notifications created");

    // ── Templates ──
    const templateData = [
        { name: "Software Engineer — JD Template", category: TemplateCategory.PLACEMENT_DRIVE, usageCount: 45 },
        { name: "Campus Placement Drive Checklist", category: TemplateCategory.PROJECT, usageCount: 32 },
        { name: "Weekly Placement Analytics Report", category: TemplateCategory.REPORT, usageCount: 28 },
        { name: "Candidate Rejection Email", category: TemplateCategory.COMMUNICATION, usageCount: 67 },
        { name: "Offer Letter — Standard Format", category: TemplateCategory.COMMUNICATION, usageCount: 23 },
        { name: "Interview Feedback Form", category: TemplateCategory.WORKFLOW, usageCount: 51 },
    ];
    for (const t of templateData) {
        await prisma.template.create({
            data: { orgId: org.id, name: t.name, category: t.category, content: {}, usageCount: t.usageCount },
        });
    }
    console.log("  ✓ Templates created");

    console.log("\n🎉 Seed complete! Login with: admin@haveloc.pro / admin123");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
