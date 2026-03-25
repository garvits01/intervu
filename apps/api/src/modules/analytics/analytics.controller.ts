import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";

@ApiTags("analytics")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("analytics")
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @Get("dashboard")
    @ApiOperation({ summary: "Get org dashboard metrics" })
    dashboard(@Query("orgId") orgId: string) {
        return this.analyticsService.getOrgDashboard(orgId);
    }

    @Get("placements/report")
    @ApiOperation({ summary: "Get placement analytics report" })
    placementReport(@Query("orgId") orgId: string) {
        return this.analyticsService.getPlacementReport(orgId);
    }
}
