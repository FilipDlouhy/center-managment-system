import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { USER_MESSAGES } from '@app/rmq';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CreateUserDTO } from '@app/database/dtos/userDtos/createUser.dto';
import { LoginUserDTO } from '@app/database/dtos/userDtos/loginUser.dto';
import { UpdateUserDTO } from '@app/database/dtos/userDtos/updateUser.dto';
import { User } from '@app/database/entities/user.entity';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Handle user creation
  @MessagePattern(USER_MESSAGES.createUser)
  async createUser(@Payload() data: CreateUserDTO): Promise<User> {
    try {
      return await this.usersService.createUser(data);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Handle getting all users
  @MessagePattern(USER_MESSAGES.getAllUsers)
  async getAllUsers(): Promise<User[]> {
    try {
      return this.usersService.getAllUsers();
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Handle getting a user by ID
  @MessagePattern(USER_MESSAGES.getUser)
  async getUser(@Payload() userId: number): Promise<User> {
    try {
      return this.usersService.getUser(userId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
  @MessagePattern(USER_MESSAGES.getUserForTask)
  async getUserForTask(
    @Payload() userIdObj: { userId: number },
  ): Promise<User | null> {
    try {
      return this.usersService.getUser(userIdObj.userId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Handle user information update
  @MessagePattern(USER_MESSAGES.updateUser)
  async updateUser(@Payload() updateUser: UpdateUserDTO): Promise<User | null> {
    try {
      return this.usersService.updateUser(updateUser);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Handle user deletion by ID
  @MessagePattern(USER_MESSAGES.deleteUser)
  async deleteUser(@Payload() userId: number): Promise<boolean> {
    try {
      return this.usersService.deleteUser(userId);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }

  // Handle user login
  @MessagePattern(USER_MESSAGES.userLogin)
  async lofinUser(@Payload() loginUser: LoginUserDTO): Promise<User> {
    try {
      return this.usersService.loginUser(loginUser);
    } catch (error) {
      throw new RpcException(error.message);
    }
  }
}
