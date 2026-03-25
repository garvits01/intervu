import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session extends DefaultSession {
        accessToken?: string;
        user: {
            id: string;
            role: string;
            orgId?: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        accessToken?: string;
        role?: string;
        orgId?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        accessToken?: string;
        id?: string;
        role?: string;
        orgId?: string;
    }
}
