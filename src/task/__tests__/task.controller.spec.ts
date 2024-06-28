import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from '../task.controller';
import { TaskService } from '../task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { UpdateStatusDto } from '../dto/update-task-status.dto';
import { Status, Task } from '../entities/task.entity';

const createTaskDto: CreateTaskDto = {
  title: 'Test Task',
  description: 'This is a test task',
};

const mockCreatedTask: Task = {
  ...createTaskDto,
  id: 1,
  createdDate: new Date(),
} as Task;

describe('TaskController', () => {
  let taskController: TaskController;
  let taskService: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            changeStatus: jest.fn(),
            findTasksByStatus: jest.fn(),
            getDaysElapsed: jest.fn(),
          },
        },
      ],
    }).compile();

    taskController = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(taskController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      jest.spyOn(taskService, 'create').mockResolvedValue(mockCreatedTask);

      const result = await taskController.create(createTaskDto);

      expect(result).toEqual(mockCreatedTask);
      expect(taskService.create).toHaveBeenCalledWith(createTaskDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      jest.spyOn(taskService, 'findAll').mockResolvedValue([mockCreatedTask]);

      const result = await taskController.findAll();

      expect(result).toEqual([mockCreatedTask]);
      expect(taskService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single task by id', async () => {
      const ID = mockCreatedTask.id;
      jest.spyOn(taskService, 'findOne').mockResolvedValue(mockCreatedTask);

      const result = await taskController.findOne(ID.toString());

      expect(result).toEqual(mockCreatedTask);
      expect(taskService.findOne).toHaveBeenCalledWith(ID);
    });
  });

  describe('update', () => {
    it('should update a task by id', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };
      const updatedTask = { ...mockCreatedTask, ...updateTaskDto };

      jest.spyOn(taskService, 'update').mockResolvedValue(updatedTask);

      const result = await taskController.update(
        mockCreatedTask.id.toString(),
        updateTaskDto,
      );

      expect(result).toEqual(updatedTask);
      expect(taskService.update).toHaveBeenCalledWith(
        mockCreatedTask.id,
        updateTaskDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a task by id', async () => {
      jest.spyOn(taskService, 'remove').mockResolvedValue(mockCreatedTask);

      const result = await taskController.remove(mockCreatedTask.id.toString());

      expect(result).toEqual(mockCreatedTask);
      expect(taskService.remove).toHaveBeenCalledWith(mockCreatedTask.id);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a task by id', async () => {
      const updateStatusDto: UpdateStatusDto = { status: Status.COMPLETADA };
      const updatedTask = { ...mockCreatedTask, status: Status.COMPLETADA };

      jest.spyOn(taskService, 'changeStatus').mockResolvedValue(updatedTask);

      const result = await taskController.updateStatus(
        mockCreatedTask.id.toString(),
        updateStatusDto,
      );

      expect(result).toEqual(updatedTask);
      expect(taskService.changeStatus).toHaveBeenCalledWith(
        mockCreatedTask.id,
        updateStatusDto.status,
      );
    });
  });

  describe('filterByStatus', () => {
    it('should return an array of tasks filtered by status', async () => {
      jest
        .spyOn(taskService, 'findTasksByStatus')
        .mockResolvedValue([mockCreatedTask]);

      const result = await taskController.filterByStatus(Status.PENDIENTE);

      expect(result).toEqual([mockCreatedTask]);
      expect(taskService.findTasksByStatus).toHaveBeenCalledWith(
        Status.PENDIENTE,
      );
    });

    it('should throw BadRequestException for invalid status', async () => {
      expect(async () => {
        await taskController.filterByStatus('IS');
      }).rejects.toThrow();
    });
  });

  describe('getDaysElapsed', () => {
    it('should return the number of days elapsed since the task was created', async () => {
      const daysElapsed = 5;
      jest
        .spyOn(taskService, 'getDaysElapsed')
        .mockResolvedValue({ elapsedDays: 5 });

      const result = await taskController.getDaysElapsed(
        mockCreatedTask.id.toString(),
      );

      expect(result.elapsedDays).toEqual(daysElapsed);
      expect(taskService.getDaysElapsed).toHaveBeenCalledWith(
        mockCreatedTask.id,
      );
    });
  });
});
