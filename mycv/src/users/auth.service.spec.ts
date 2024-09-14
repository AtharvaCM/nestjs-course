import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
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
    fakeUsersService.find = () =>
      Promise.resolve([
        { id: 1, email: 'test@example.com', password: 'testpassword' } as User,
      ]);

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
    fakeUsersService.find = () =>
      Promise.resolve([
        { email: 'test@example.com', password: 'correctpassword' } as User,
      ]);

    await expect(
      service.signin('test@example.com', 'incorrectpassowrd'),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns an user if a correct password is provided', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        {
          email: 'test@example.com',
          password:
            '54402f4329e1823e.1c6b501c8dcbfe29136539438b91115e6e74618e9b84baec353d85ee7b23f1f5',
        } as User,
      ]);

    const user = await service.signin('test@example.com', 'mypassword');
    expect(user).toBeDefined();
  });
});
