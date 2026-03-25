import { Controller, Get, Put, Body, Param, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("users")
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    @ApiOperation({ summary: "List users" })
    findAll(@Query("orgId") orgId?: string) {
        return this.usersService.findAll(orgId);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get user by ID" })
    findOne(@Param("id") id: string) {
        return this.usersService.findById(id);
    }

    @Put(":id")
    @ApiOperation({ summary: "Update user profile" })
    update(@Param("id") id: string, @Body() data: { name?: string; avatarUrl?: string }) {
        return this.usersService.updateProfile(id, data);
    }
}
