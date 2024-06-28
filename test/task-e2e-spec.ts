import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { CreateTaskDto } from 'src/task/dto/create-task.dto';
import { UpdateTaskDto } from 'src/task/dto/update-task.dto';
import { Status, Task } from 'src/task/entities/task.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import * as request from 'supertest';
import { Repository } from 'typeorm';

describe('Task - e2e', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let taskRepository: Repository<Task>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
    taskRepository = moduleRef.get<Repository<Task>>(getRepositoryToken(Task));

    // Eliminar las tablas antes de iniciar tests
    await taskRepository.query(`TRUNCATE TABLE task RESTART IDENTITY CASCADE;`);
    await userRepository.query(
      `TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;`,
    );
  });

  const createTaskDto: CreateTaskDto = {
    title: 'Titulo tarea 1',
    description: 'Descripcion tarea 1',
  };

  describe('Get all tasks - [GET /tasks]', () => {
    it('should return an array of tasks', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/tasks')
        .expect(HttpStatus.OK);

      const expectedTasks = [];

      expect(body).toEqual(expectedTasks);
      expect(body).toHaveLength(0);
    });
  });

  describe('Create - [POST /tasks]', () => {
    it('should create a task', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/tasks')
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      const expectedTask = expect.objectContaining({
        id: 1,
        ...createTaskDto,
        status: Status.PENDIENTE,
        createdDate: expect.any(String),
      });

      expect(body).toEqual(expectedTask);
    });

    it('should create a task associated to a user', async () => {
      const newUserDto: CreateUserDto = {
        name: 'nn',
        email: 'nn@mail.com',
      };

      const createdUserResponse = await request(app.getHttpServer())
        .post('/users')
        .send(newUserDto);

      const { body } = await request(app.getHttpServer())
        .post('/tasks')
        .send({ ...createTaskDto, userId: createdUserResponse.body.id })
        .expect(HttpStatus.CREATED);

      const expectedTask = expect.objectContaining({
        id: 2,
        ...createTaskDto,
        status: Status.PENDIENTE,
        createdDate: expect.any(String),
        user: createdUserResponse.body,
      });

      expect(body).toEqual(expectedTask);
    });

    it('should throw an error if there are missing props when creating an task', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({})
        .expect({
          statusCode: 400,
          message: ['title must be a string', 'description must be a string'],
          error: 'Bad Request',
        });
    });
  });

  describe('Get all tasks after creating - [GET /tasks]', () => {
    it('should return an array of tasks', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/tasks')
        .expect(HttpStatus.OK);

      expect(body).toHaveLength(2);
    });
  });

  describe('Get - [GET /task/:id]', () => {
    it('should return a single task by id', async () => {
      const { body } = await request(app.getHttpServer())
        .get(`/tasks/1`)
        .expect(HttpStatus.OK);

      const expectedTask = expect.objectContaining({
        id: 1,
        ...createTaskDto,
        status: Status.PENDIENTE,
        createdDate: expect.any(String),
      });

      expect(body).toEqual(expectedTask);
    });

    it('should return an error if task is not found', async () => {
      const TASK_ID = 999;

      const { body } = await request(app.getHttpServer())
        .get(`/tasks/${TASK_ID}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(body).toEqual({
        error: 'Not Found',
        message: 'No task with id : ' + TASK_ID,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('Update - [PATCH /tasks/:id]', () => {
    it('should update a task', async () => {
      const TASK_TO_UPDATE_ID = 1;
      const updateTaskDto: UpdateTaskDto = {
        title: 'Titulo UPDATED',
        description: 'Updated',
      };

      const { body } = await request(app.getHttpServer())
        .patch(`/tasks/${TASK_TO_UPDATE_ID}`)
        .send(updateTaskDto)
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        id: TASK_TO_UPDATE_ID,
        ...updateTaskDto,
        createdDate: expect.any(String),
        status: Status.PENDIENTE,
        user: null,
      });
    });
  });

  describe('Delete - [DELETE /tasks/:id]', () => {
    it('should delete a task logically, change task.status:"eliminada"', async () => {
      const TASK_ID = 1;

      const resBeforeDelete = await request(app.getHttpServer())
        .get(`/tasks/${TASK_ID}`)
        .expect(HttpStatus.OK);

      expect(resBeforeDelete.body.status).toBe(Status.PENDIENTE);

      await request(app.getHttpServer())
        .delete(`/tasks/${TASK_ID}`)
        .expect(HttpStatus.OK);

      const resAfterDelete = await request(app.getHttpServer())
        .get(`/tasks/${TASK_ID}`)
        .expect(HttpStatus.OK);

      expect(resAfterDelete.body.status).toBe(Status.ELIMINADA);
    });
  });

  describe('Update Status - [PATCH /tasks/:id/status]', () => {
    it('should delete update task status', async () => {
      const TASK_ID = 2;

      const resBeforeUpdate = await request(app.getHttpServer())
        .get(`/tasks/${TASK_ID}`)
        .expect(HttpStatus.OK);

      expect(resBeforeUpdate.body.status).toBe(Status.PENDIENTE);

      await request(app.getHttpServer())
        .patch(`/tasks/${TASK_ID}/status`)
        .send({ status: Status.COMPLETADA })
        .expect(HttpStatus.OK);

      const resAfterUpdate = await request(app.getHttpServer())
        .get(`/tasks/${TASK_ID}`)
        .expect(HttpStatus.OK);

      expect(resAfterUpdate.body.status).toBe(Status.COMPLETADA);
    });
  });

  describe('Filter By Status - [GET /tasks/status/:status]', () => {
    it('should return an array with filtered tasks by status', async () => {
      const statusToFilter = Status.COMPLETADA;

      const { body } = await request(app.getHttpServer())
        .get(`/tasks/status/${statusToFilter}`)
        .expect(HttpStatus.OK);

      expect(body).toHaveLength(1);
      expect(body[0].status).toBe(Status.COMPLETADA);
    });
  });

  describe('Days elapsed - [GET /tasks/:id/days-elapsed]', () => {
    it('should return days elapsed from createdDate of task', async () => {
      // Create a task in the past
      const taskInThePastEntity = taskRepository.create({
        title: 'Task 6 days ago',
        description: 'Santa Ciencia',
        createdDate: new Date(Date.now() - 60 * 60 * 24 * 1000 * 6), // 6 days ago
      });

      const taskInThePast = await taskRepository.save(taskInThePastEntity);

      const { body } = await request(app.getHttpServer())
        .get(`/tasks/${taskInThePast.id}/days-elapsed`)
        .expect(HttpStatus.OK);

      expect(body.elapsedDays).toBe(6);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
