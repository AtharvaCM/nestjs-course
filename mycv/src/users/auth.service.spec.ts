import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@example.com', 'testpassword');

    expect(user.password).not.toEqual('asddf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('test@example.com', 'mypassword');

    await expect(
      service.signup('test@example.com', 'testpassword'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws an error if signin is called with an unused email', async () => {
    await expect(
      service.signin('test@example.com', 'testpassword'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws an error if an invalid password is provided', async () => {
    await service.signup('test@example.com', 'correctpassword');

    await expect(
      service.signin('test@example.com', 'incorrectpassowrd'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns an user if a correct password is provided', async () => {
    await service.signup('test@example.com', 'mypassword');

    const user = await service.signin('test@example.com', 'mypassword');
    expect(user).toBeDefined();
  });
});
