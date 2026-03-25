import { Resolver, Mutation, Args, ObjectType, Field } from "@nestjs/graphql";
import { AuthService } from "./auth.service";

@ObjectType()
class AuthTokenResponse {
    @Field()
    accessToken!: string;

    @Field()
    refreshToken!: string;

    @Field()
    expiresIn!: number;
}

@Resolver()
export class AuthResolver {
    constructor(private authService: AuthService) { }

    @Mutation(() => AuthTokenResponse)
    async login(
        @Args("email") email: string,
        @Args("password") password: string
    ): Promise<AuthTokenResponse> {
        const result = await this.authService.login(email, password);
        return result.tokens;
    }

    @Mutation(() => AuthTokenResponse)
    async refreshToken(
        @Args("refreshToken") refreshToken: string
    ): Promise<AuthTokenResponse> {
        return this.authService.refreshTokens(refreshToken);
    }
}
