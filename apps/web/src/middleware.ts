import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized: ({ req, token }) => {
            // Protect dashboard and placements routes — require valid session token
            if (
                req.nextUrl.pathname.startsWith("/dashboard") ||
                req.nextUrl.pathname.startsWith("/placements")
            ) {
                return !!token;
            }
            return true;
        },
    },
});

export const config = {
    matcher: ["/dashboard/:path*", "/placements/:path*"],
};
