import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Status, Task } from './entities/task.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    let user: User | undefined;

    if (createTaskDto.userId) {
      user = await this.userRepository.findOne({
        where: { id: createTaskDto.userId },
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${createTaskDto.userId} not found`,
        );
      }
    }
    const task = this.taskRepository.create(createTaskDto);
    if (user) {
      task.user = user;
    }
    return this.taskRepository.save(task);
  }

  findAll() {
    return this.taskRepository.find();
  }

  async findOne(id: number) {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('No task with id : ' + id);
    }
    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);

    Object.assign(task, updateTaskDto);

    return this.taskRepository.save(task);
  }

  async remove(id: number) {
    const task = await this.findOne(id);
    task.status = Status.ELIMINADA;

    return this.taskRepository.save(task);
  }

  async changeStatus(id: number, status: Status) {
    const task = await this.findOne(id);
    task.status = status;

    return this.taskRepository.save(task);
  }

  async findTasksByStatus(status: Status) {
    return this.taskRepository.find({ where: { status } });
  }

  async getDaysElapsed(id: number) {
    const task = await this.findOne(id);

    const currentDate = new Date();
    const createdAt = task.createdDate;
    const elapsedMilliseconds = currentDate.getTime() - createdAt.getTime();
    const elapsedDays = Math.round(elapsedMilliseconds / (1000 * 60 * 60 * 24));

    return elapsedDays;
  }
}
