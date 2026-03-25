import { Resolver, Query, Mutation, Args, ObjectType, Field, ID, registerEnumType } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { TasksService } from "./tasks.service";

@ObjectType()
class TaskUser {
    @Field(() => ID) id!: string;
    @Field() name!: string;
    @Field({ nullable: true }) avatarUrl?: string;
}

@ObjectType()
class TaskGQL {
    @Field(() => ID) id!: string;
    @Field() title!: string;
    @Field({ nullable: true }) description?: string;
    @Field() status!: string;
    @Field() priority!: string;
    @Field({ nullable: true }) dueDate?: Date;
    @Field(() => [String]) tags!: string[];
    @Field() aiGenerated!: boolean;
    @Field({ nullable: true }) aiConfidence?: number;
    @Field(() => TaskUser, { nullable: true }) assignee?: TaskUser;
    @Field(() => TaskUser) creator!: TaskUser;
    @Field() createdAt!: Date;
    @Field() updatedAt!: Date;
}

@Resolver()
export class TasksResolver {
    constructor(private tasksService: TasksService) { }

    @Query(() => [TaskGQL])
    @UseGuards(AuthGuard("jwt"))
    async tasks(
        @Args("projectId", { nullable: true }) projectId?: string,
        @Args("status", { nullable: true }) status?: string,
        @Args("page", { nullable: true, defaultValue: 1 }) page?: number
    ) {
        const result = await this.tasksService.findAll({
            projectId,
            status: status as any,
            page,
        });
        return result.tasks;
    }

    @Query(() => TaskGQL)
    @UseGuards(AuthGuard("jwt"))
    async task(@Args("id") id: string) {
        return this.tasksService.findById(id);
    }

    @Mutation(() => TaskGQL)
    @UseGuards(AuthGuard("jwt"))
    async createTask(
        @Args("projectId") projectId: string,
        @Args("creatorId") creatorId: string,
        @Args("title") title: string,
        @Args("description", { nullable: true }) description?: string
    ) {
        return this.tasksService.create({ projectId, creatorId, title, description });
    }

    @Mutation(() => TaskGQL)
    @UseGuards(AuthGuard("jwt"))
    async updateTaskStatus(
        @Args("id") id: string,
        @Args("status") status: string
    ) {
        return this.tasksService.update(id, { status: status as any });
    }
}
