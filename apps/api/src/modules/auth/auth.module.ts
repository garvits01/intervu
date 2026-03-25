import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AuthResolver } from "./auth.resolver";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { RolesGuard } from "./guards/roles.guard";

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>("NEXTAUTH_SECRET", "dev-secret"),
                signOptions: { expiresIn: "7d" },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, JwtStrategy, AuthResolver, RolesGuard],
    controllers: [AuthController],
    exports: [AuthService, RolesGuard],
})
export class AuthModule { }
