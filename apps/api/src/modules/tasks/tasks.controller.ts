import {
    Controller, Get, Post, Put, Delete, Body, Param, Query,
    UseGuards, HttpCode, HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { TasksService, CreateTaskDto, UpdateTaskDto, TaskFilters } from "./tasks.service";

@ApiTags("tasks")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("tasks")
export class TasksController {
    constructor(private tasksService: TasksService) { }

    @Post()
    @ApiOperation({ summary: "Create a new task" })
    create(@Body() dto: CreateTaskDto) {
        return this.tasksService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: "List tasks with filters and pagination" })
    @ApiQuery({ name: "projectId", required: false })
    @ApiQuery({ name: "status", required: false })
    @ApiQuery({ name: "priority", required: false })
    @ApiQuery({ name: "search", required: false })
    @ApiQuery({ name: "page", required: false, type: Number })
    @ApiQuery({ name: "limit", required: false, type: Number })
    findAll(@Query() filters: TaskFilters) {
        return this.tasksService.findAll(filters);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get task by ID" })
    findOne(@Param("id") id: string) {
        return this.tasksService.findById(id);
    }

    @Put(":id")
    @ApiOperation({ summary: "Update task" })
    update(@Param("id") id: string, @Body() dto: UpdateTaskDto) {
        return this.tasksService.update(id, dto);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: "Delete task" })
    remove(@Param("id") id: string) {
        return this.tasksService.delete(id);
    }

    @Get("project/:projectId/stats")
    @ApiOperation({ summary: "Get task stats for a project" })
    projectStats(@Param("projectId") projectId: string) {
        return this.tasksService.getProjectStats(projectId);
    }
}
