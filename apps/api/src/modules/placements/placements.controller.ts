import {
    Controller, Get, Post, Put, Body, Param, Query,
    UseGuards, HttpCode, HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PlacementsService, CreateDriveDto, MatchRequestDto } from "./placements.service";

@ApiTags("placements")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("placements")
export class PlacementsController {
    constructor(private placementsService: PlacementsService) { }

    @Post("drives")
    @ApiOperation({ summary: "Create a new placement drive" })
    createDrive(@Body() dto: CreateDriveDto) {
        return this.placementsService.createDrive(dto);
    }

    @Get("drives")
    @ApiOperation({ summary: "List placement drives for an org" })
    listDrives(@Query("orgId") orgId: string, @Query("status") status?: any) {
        return this.placementsService.listDrives(orgId, status);
    }

    @Get("drives/:id")
    @ApiOperation({ summary: "Get placement drive details" })
    getDrive(@Param("id") id: string) {
        return this.placementsService.getDrive(id);
    }

    @Put("drives/:id/status")
    @ApiOperation({ summary: "Update drive status" })
    updateStatus(@Param("id") id: string, @Body("status") status: any) {
        return this.placementsService.updateDriveStatus(id, status);
    }

    @Post("drives/:driveId/register")
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Register a candidate for a drive" })
    register(
        @Param("driveId") driveId: string,
        @Body("candidateId") candidateId: string
    ) {
        return this.placementsService.registerCandidate(driveId, candidateId);
    }

    @Post("match")
    @ApiOperation({ summary: "Trigger AI matching for a drive" })
    triggerMatch(@Body() dto: MatchRequestDto) {
        return this.placementsService.triggerMatchingAI(dto);
    }

    @Get("drives/:id/stats")
    @ApiOperation({ summary: "Get drive analytics" })
    driveStats(@Param("id") id: string) {
        return this.placementsService.getDriveStats(id);
    }
}
