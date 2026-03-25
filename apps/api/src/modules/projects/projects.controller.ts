import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ProjectsService } from "./projects.service";

@ApiTags("projects")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("projects")
export class ProjectsController {
    constructor(private projectsService: ProjectsService) { }

    @Post()
    @ApiOperation({ summary: "Create a project" })
    create(@Body() data: { orgId: string; name: string; description?: string }) {
        return this.projectsService.create(data);
    }

    @Get()
    @ApiOperation({ summary: "List projects by org" })
    findAll(@Query("orgId") orgId: string, @Query("status") status?: any) {
        return this.projectsService.findAll(orgId, status);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get project details" })
    findOne(@Param("id") id: string) {
        return this.projectsService.findById(id);
    }

    @Put(":id")
    @ApiOperation({ summary: "Update project" })
    update(@Param("id") id: string, @Body() data: { name?: string; description?: string; status?: any }) {
        return this.projectsService.update(id, data);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: "Delete project" })
    remove(@Param("id") id: string) {
        return this.projectsService.delete(id);
    }
}
