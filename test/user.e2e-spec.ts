import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { Task } from 'src/task/entities/task.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { User } from 'src/user/entities/user.entity';
import * as request from 'supertest';
import { Repository } from 'typeorm';

describe('User - e2e', () => {
  let app: INestApplication;

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

    const userRepository = moduleRef.get<Repository<User>>(
      getRepositoryToken(User),
    );
    const taskRepository = moduleRef.get<Repository<Task>>(
      getRepositoryToken(Task),
    );

    // Eliminar las tablas antes de iniciar tests
    await taskRepository.query(`TRUNCATE TABLE task RESTART IDENTITY CASCADE;`);
    await userRepository.query(
      `TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;`,
    );
  });

  const createUserDto: CreateUserDto = {
    name: 'Nico',
    email: 'nico@unmail.com',
  };

  describe('Get all users - [GET /users]', () => {
    it('should return an array of users', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.OK);
      const expectedUsers = [];
      expect(body).toEqual(expectedUsers);
      expect(body).toHaveLength(0);
    });
  });

  describe('Create - [POST /users]', () => {
    it('should create an user', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const expecteduser = expect.objectContaining({
        id: 1,
        ...createUserDto,
      });

      expect(body).toEqual(expecteduser);
    });

    it('should throw an error if there are missing props when creating an user', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({})
        .expect({
          statusCode: 400,
          message: ['name must be a string', 'email must be an email'],
          error: 'Bad Request',
        });
    });

    it('should throw an error when creating an user with an already registered email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Nico',
          email: 'nico@unmail.com',
        })
        .expect({
          statusCode: 400,
          message: 'nico@unmail.com is already registered',
          error: 'Bad Request',
        });
    });
  });

  describe('Get all users after creating a user - [GET /users]', () => {
    it('should return an array of users with the user created in the previous test', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.OK);
      const expectedUsers = [{ ...createUserDto, id: 1 }];
      expect(body).toEqual(expectedUsers);
      expect(body).toHaveLength(1);
    });
  });

  describe('Get - [GET /users/:id]', () => {
    it('should return an user by id', async () => {
      const { body } = await request(app.getHttpServer())
        .get(`/users/1`)
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        id: 1,
        ...createUserDto,
      });
    });

    it('should return an error if user is not found', async () => {
      const USER_ID = 999;

      const { body } = await request(app.getHttpServer())
        .get(`/users/${USER_ID}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(body).toEqual({
        error: 'Not Found',
        message: 'No user with id : ' + USER_ID,
        statusCode: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('Update - [PATCH /users/:id]', () => {
    it('should update an user', async () => {
      const USER_TO_UPDATE_ID = 1;
      const updateUserDto: UpdateUserDto = {
        name: 'Nicolas',
        email: 'otroemail@email.com.ar',
      };

      const { body } = await request(app.getHttpServer())
        .patch(`/users/${USER_TO_UPDATE_ID}`)
        .send(updateUserDto)
        .expect(HttpStatus.OK);

      expect(body).toEqual({
        id: USER_TO_UPDATE_ID,
        ...updateUserDto,
      });
    });

    describe('Delete - [DELETE /users/:id]', () => {
      it('should successfully delete an user', async () => {
        const USER_ID = 1;

        const resBeforDelete = await request(app.getHttpServer())
          .get('/users')
          .expect(HttpStatus.OK);
        expect(resBeforDelete.body).toHaveLength(1);

        await request(app.getHttpServer())
          .delete(`/users/${USER_ID}`)
          .expect(HttpStatus.OK);

        const resAfterDelete = await request(app.getHttpServer())
          .get('/users')
          .expect(HttpStatus.OK);
        expect(resAfterDelete.body).toHaveLength(0);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
