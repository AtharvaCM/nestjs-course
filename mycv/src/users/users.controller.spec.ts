import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let mockedUsersService: Partial<UsersService>;
  let mockedAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockedUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'test@example.com',
          password: 'mypassword',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([
          {
            id: 1,
            email: email,
            password: 'mypassword',
          } as User,
        ]);
      },
      remove: (id: number) => {
        return Promise.resolve({
          id,
          email: 'test@example.com',
          password: 'mypassword',
        } as User);
      },
      // update: (id: number, attrs: Partial<Userr>) => {},
    };
    mockedAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockedUsersService,
        },
        {
          provide: AuthService,
          useValue: mockedAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers('test@example.com');

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@example.com');
  });

  it('findUser returns a single user with the given id', async () => {
    const user = await controller.findUser('1');

    expect(user).toBeDefined();
  });

  it('findUser throws an error if user with given id is not found', async () => {
    mockedUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('SignIn updates session object and returns user', async () => {
    const session = { userId: -1 };
    const user = await controller.signin(
      { email: 'test@example.com', password: 'mypassword' },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
