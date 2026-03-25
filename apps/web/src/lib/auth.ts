import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const res = await fetch("http://localhost:4000/api/v1/auth/login", {
                        method: "POST",
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                        headers: { "Content-Type": "application/json" },
                    });

                    const data = await res.json();

                    if (res.ok && data.user && data.tokens) {
                        return {
                            id: data.user.id,
                            name: data.user.name,
                            email: data.user.email,
                            image: data.user.avatarUrl,
                            accessToken: data.tokens.accessToken,
                            role: data.user.role,
                            orgId: data.user.orgMemberships?.[0]?.orgId,
                        };
                    }
                    return null;
                } catch (error) {
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: "/login",
        error: "/login", // Error code passed in query string as ?error=
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.id = user.id;
                token.role = (user as any).role;
                token.orgId = (user as any).orgId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session as any).accessToken = token.accessToken;
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).orgId = token.orgId;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
};
