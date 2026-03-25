import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

/**
 * Guard that checks if the authenticated user has one of the required roles.
 * Must be used alongside @UseGuards(AuthGuard('jwt')) to ensure `request.user` exists.
 *
 * Usage:
 *   @UseGuards(AuthGuard('jwt'), RolesGuard)
 *   @Roles('ADMIN', 'SUPER_ADMIN')
 *   @Get('admin-only')
 *   getAdminData() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()]
        );

        // If no @Roles() decorator is applied, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException("Access denied: no role assigned");
        }

        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            throw new ForbiddenException(
                `Access denied: requires one of [${requiredRoles.join(", ")}], but you have [${user.role}]`
            );
        }

        return true;
    }
}
