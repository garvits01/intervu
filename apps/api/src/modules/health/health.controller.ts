import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
    @Get()
    @ApiOperation({ summary: "Health check endpoint" })
    check() {
        return {
            status: "ok",
            service: "haveloc-pro-api",
            version: "0.1.0",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
}
