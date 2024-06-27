import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateStatusDto } from './dto/update-task-status.dto';
import { Status } from './entities/task.entity';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    const status = updateStatusDto.status as Status;
    return this.taskService.changeStatus(+id, status);
  }

  @Get('status/:status')
  filterByStatus(@Param('status') status: string) {
    const isValidStatus = Object.values(Status).includes(status as Status);

    if (!isValidStatus) {
      throw new BadRequestException(
        'Invalid status. Must be one of: ' + Object.values(Status),
      );
    }

    return this.taskService.findTasksByStatus(status as Status);
  }

  @Get(':id/days-elapsed')
  async getDaysElapsed(@Param('id') id: string) {
    return this.taskService.getDaysElapsed(+id);
  }
}
