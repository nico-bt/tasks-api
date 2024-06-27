import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UpdateUserDto } from '../dto/update-user.dto';

const createUserDto: CreateUserDto = {
  name: 'Pepe',
  email: 'pepe@ticmas.com',
};

const mockCreatedUser: User = {
  ...createUserDto,
  id: 1,
} as User;

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      jest.spyOn(userService, 'create').mockResolvedValue(mockCreatedUser);

      const result = await userController.create(createUserDto);

      expect(result).toEqual(mockCreatedUser);
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(userService, 'findAll').mockResolvedValue([mockCreatedUser]);

      const result = await userController.findAll();

      expect(result).toEqual([mockCreatedUser]);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      const ID = mockCreatedUser.id;
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockCreatedUser);

      const result = await userController.findOne(ID.toString());

      expect(result).toEqual(mockCreatedUser);
      expect(userService.findOne).toHaveBeenCalledWith(ID);
    });
  });

  describe('update', () => {
    it('should update a user by id', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const updatedUser = { ...mockCreatedUser, ...updateUserDto };

      jest.spyOn(userService, 'update').mockResolvedValue(updatedUser);

      const result = await userController.update(
        mockCreatedUser.id.toString(),
        updateUserDto,
      );

      expect(result).toEqual(updatedUser);
      expect(userService.update).toHaveBeenCalledWith(
        mockCreatedUser.id,
        updateUserDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      jest.spyOn(userService, 'remove').mockResolvedValue(mockCreatedUser);

      const result = await userController.remove(mockCreatedUser.id.toString());

      expect(userService.remove).toHaveBeenCalledWith(mockCreatedUser.id);
      expect(result).toEqual(mockCreatedUser);
    });
  });
});
