import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { TasksResolver } from "./tasks.resolver";

@Module({
    providers: [TasksService, TasksResolver],
    controllers: [TasksController],
    exports: [TasksService],
})
export class TasksModule { }
