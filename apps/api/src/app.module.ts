import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { EventEmitterModule } from "@nestjs/event-emitter";
// import { GraphQLModule } from "@nestjs/graphql";
// import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
// import { join } from "path";

import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { PlacementsModule } from "./modules/placements/placements.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
    imports: [
        // ── Configuration ──
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [".env.local", ".env"],
        }),

        // ── Rate Limiting ──
        ThrottlerModule.forRoot([
            {
                name: "short",
                ttl: 1000,
                limit: 10,
            },
            {
                name: "medium",
                ttl: 10000,
                limit: 50,
            },
            {
                name: "long",
                ttl: 60000,
                limit: 100,
            },
        ]),

        // ── Event Emitter ──
        EventEmitterModule.forRoot({
            wildcard: true,
            delimiter: ".",
            maxListeners: 20,
        }),

        // ── GraphQL (disabled - requires @as-integrations/express5) ──
        // GraphQLModule.forRoot<ApolloDriverConfig>({
        //     driver: ApolloDriver,
        //     autoSchemaFile: join(process.cwd(), "src/schema.gql"),
        //     sortSchema: true,
        //     playground: process.env.NODE_ENV !== "production",
        //     introspection: process.env.NODE_ENV !== "production",
        //     context: ({ req, res }: { req: Request; res: Response }) => ({
        //         req,
        //         res,
        //     }),
        // }),

        // ── Infrastructure ──
        PrismaModule,
        RedisModule,

        // ── Feature Modules ──
        AuthModule,
        UsersModule,
        ProjectsModule,
        TasksModule,
        PlacementsModule,
        AnalyticsModule,
        HealthModule,
    ],
})
export class AppModule { }
