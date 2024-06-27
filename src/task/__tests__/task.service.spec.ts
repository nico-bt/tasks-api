import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';
import { Status, Task } from '../entities/task.entity';
import { TaskService } from '../task.service';
import { UpdateTaskDto } from '../dto/update-task.dto';

const createTaskDto: CreateTaskDto = {
  title: 'Test Task',
  description: 'This is a test task',
  userId: 1,
};

const mockTask = {
  id: 1,
  title: 'Test Task',
  description: 'This is a test task',
  status: Status.PENDIENTE,
  createdDate: new Date(),
  user: null,
} as Task;

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
} as User;

const mockTaskRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('TaskService', () => {
  let taskService: TaskService;
  let taskRepository: Repository<Task>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useFactory: mockTaskRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(taskService).toBeDefined();
  });

  describe('Create', () => {
    it('should create a new task with the passed data calling taskRepository', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(taskRepository, 'create').mockReturnValue(mockTask);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(mockTask);

      const result = await taskService.create(createTaskDto);
      expect(result).toEqual(mockTask);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: createTaskDto.userId },
      });
      expect(taskRepository.create).toHaveBeenCalledWith(createTaskDto);
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
    });

    it('should throw a NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(taskService.create(createTaskDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const mockedTasks = [mockTask];

      jest.spyOn(taskRepository, 'find').mockResolvedValue(mockedTasks);

      expect(await taskService.findAll()).toEqual(mockedTasks);
    });
  });

  describe('findOne', () => {
    it('should return a single task by id', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(mockTask);

      const result = await taskService.findOne(mockTask.id);

      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTask.id },
      });
    });

    it('should throw an error if task is not found', async () => {
      const ID = 9999;
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(null);

      await expect(taskService.findOne(ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateTaskDto: UpdateTaskDto = {
      title: 'Updated Task',
      description: 'This is an updated task description',
    };
    const mockUpdatedTask = { ...mockTask, ...updateTaskDto };

    it('should update a task by id', async () => {
      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(mockTask);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(mockUpdatedTask);

      const result = await taskService.update(mockTask.id, updateTaskDto);

      expect(result).toEqual(mockUpdatedTask);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTask.id },
      });
    });
  });

  describe('remove', () => {
    it('should mark a task as removed by id by changing status to "ELIMINADA', async () => {
      const mockRemovedTask = { ...mockTask, status: Status.ELIMINADA };

      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(mockTask);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(mockRemovedTask);

      const result = await taskService.remove(mockTask.id);

      expect(result.status).toBe(Status.ELIMINADA);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTask.id },
      });
      expect(taskRepository.save).toHaveBeenCalledWith(mockRemovedTask);
    });
  });

  describe('changeStatus', () => {
    it('should change the status of a task', async () => {
      const newStatus = Status.COMPLETADA;
      const mockUpdatedTask = { ...mockTask, status: newStatus };

      jest.spyOn(taskRepository, 'findOne').mockResolvedValue(mockTask);
      jest.spyOn(taskRepository, 'save').mockResolvedValue(mockUpdatedTask);

      const result = await taskService.changeStatus(mockTask.id, newStatus);

      expect(result.status).toBe(newStatus);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTask.id },
      });
      expect(taskRepository.save).toHaveBeenCalledWith(mockUpdatedTask);
    });
  });

  describe('findTasksByStatus', () => {
    it('should return tasks filtered by status', async () => {
      const statusToFilter = Status.COMPLETADA;

      // Agrego a la respuesta mockeada una tarea con status COMPLETADA
      const mockTask2 = { ...mockTask, id: 2, status: Status.COMPLETADA };
      const mockTasks = [mockTask, mockTask2];

      jest
        .spyOn(taskRepository, 'find')
        .mockResolvedValue(
          mockTasks.filter((item) => item.status === statusToFilter),
        );

      const result = await taskService.findTasksByStatus(statusToFilter);

      expect(result).toEqual(mockTasks);
      expect(taskRepository.find).toHaveBeenCalledWith({
        where: { status: statusToFilter },
      });
    });
  });

  describe('getDaysElapsed', () => {
    it('should return the number of days elapsed since task creation', async () => {
      const mockTaskInThePast = {
        ...mockTask,
        createdDate: new Date(Date.now() - 60 * 60 * 24 * 1000 * 6), // 6 days ago
      };

      jest
        .spyOn(taskRepository, 'findOne')
        .mockResolvedValue(mockTaskInThePast);

      const result = await taskService.getDaysElapsed(mockTaskInThePast.id);

      expect(result).toBe(6);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTaskInThePast.id },
      });
    });
  });
});
