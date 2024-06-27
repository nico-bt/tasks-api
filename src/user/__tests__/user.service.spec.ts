import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';

const createUserDto: CreateUserDto = {
  name: 'Pepe',
  email: 'pepe@ticmas.com',
};

const mockCreatedUser = {
  ...createUserDto,
  id: 2,
} as User;

const mockUserRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('Create', () => {
    it('should create a new user with the passed data calling userRepository', async () => {
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockCreatedUser);

      const result = await userService.create(createUserDto);
      expect(result).toEqual(mockCreatedUser);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw a BadRequestException if email is already registered', async () => {
      // Mock findOne: Looking if user already exists returns an existing client
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockCreatedUser);

      await expect(userService.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockedusers = [mockCreatedUser];

      jest.spyOn(userRepository, 'find').mockResolvedValue(mockedusers);

      expect(await userService.findAll()).toEqual(mockedusers);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      const ID = 880;
      const mockUser = { ...mockCreatedUser, id: ID };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await userService.findOne(ID);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: ID },
      });
    });

    it('should throw an error if user is not found', async () => {
      const ID = 9999;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(userService.findOne(ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      ...createUserDto,
      name: 'Roberto Carlos',
    };
    const mockUpdatedUser = { ...mockCreatedUser, name: 'Roberto Carlos' };

    it('should update a user by id', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockCreatedUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUpdatedUser);

      const result = await userService.update(
        mockCreatedUser.id,
        updateUserDto,
      );

      expect(result).toEqual(mockUpdatedUser);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCreatedUser.id },
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUpdatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user by id', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockCreatedUser);

      await userService.remove(mockCreatedUser.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCreatedUser.id },
      });
      expect(userRepository.remove).toHaveBeenCalledWith(mockCreatedUser);
    });
  });
});
