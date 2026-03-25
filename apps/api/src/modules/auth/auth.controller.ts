import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";
import { AuthService, AuthTokens, AuthResponse } from "./auth.service";

class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;
}

class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsString()
    name!: string;
}

class RefreshDto {
    @IsString()
    refreshToken!: string;
}

@ApiTags("auth")
@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Login with email and password" })
    @ApiResponse({ status: 200, description: "Returns User and JWT tokens" })
    async login(@Body() dto: LoginDto): Promise<AuthResponse> {
        return this.authService.login(dto.email, dto.password);
    }

    @Post("register")
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: "Register a new user" })
    @ApiResponse({ status: 201, description: "Returns User and JWT tokens" })
    async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
        return this.authService.register(dto.email, dto.password, dto.name);
    }

    @Post("refresh")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Refresh access token" })
    @ApiResponse({ status: 200, description: "Returns new JWT tokens" })
    async refresh(@Body() dto: RefreshDto): Promise<AuthTokens> {
        return this.authService.refreshTokens(dto.refreshToken);
    }

    @Get("me")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get current authenticated user profile" })
    @ApiResponse({ status: 200, description: "Returns the authenticated user's profile and role" })
    async getMe(@Req() req: any) {
        const payload = req.user; // JwtPayload from JwtStrategy.validate()
        const userDetails = await this.authService.validateUser(payload.sub);
        return {
            id: userDetails.sub,
            email: userDetails.email,
            role: userDetails.role,
            orgId: userDetails.orgId,
        };
    }
}
