import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import compression from "compression";
import { AppModule } from "./app.module";

async function bootstrap() {
    const logger = new Logger("Bootstrap");
    const app = await NestFactory.create(AppModule, {
        logger: ["error", "warn", "log", "debug", "verbose"],
    });

    // ── Security ──
    app.use(helmet());
    app.use(compression());
    app.enableCors({
        origin: process.env.WEB_URL || "http://localhost:3001",
        credentials: true,
    });

    // ── Validation ──
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        })
    );

    // ── API Prefix ──
    app.setGlobalPrefix("api/v1", {
        exclude: ["health", "graphql"],
    });

    // ── Swagger ──
    const config = new DocumentBuilder()
        .setTitle("Haveloc Pro API")
        .setDescription(
            "Enterprise Project Management & Placement Automation API"
        )
        .setVersion("1.0.0")
        .addBearerAuth()
        .addTag("auth", "Authentication & Authorization")
        .addTag("users", "User Management")
        .addTag("projects", "Project Management")
        .addTag("tasks", "Task Management")
        .addTag("placements", "Placement Automation")
        .addTag("analytics", "Analytics & Reports")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: "none",
        },
    });

    // ── Start ──
    const port = process.env.PORT || 4000;
    await app.listen(port);
    logger.log(`🚀 Haveloc Pro API running on http://localhost:${port}`);
    logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
    logger.log(`🔮 GraphQL playground at http://localhost:${port}/graphql`);
}

bootstrap();
