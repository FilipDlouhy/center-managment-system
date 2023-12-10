import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { USER_MESSAGES } from '@app/rmq';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
    return this.usersService.createUser(data);
  }

  // Handle getting all users
  @MessagePattern(USER_MESSAGES.getAllUsers)
  async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  // Handle getting a user by ID
  @MessagePattern(USER_MESSAGES.getUser)
  async getUser(@Payload() userId: number): Promise<User> {
    return this.usersService.getUser(userId);
  }
  @MessagePattern(USER_MESSAGES.getUserForTask)
  async getUserForTask(
    @Payload() userIdObj: { userId: number },
  ): Promise<User | null> {
    return this.usersService.getUser(userIdObj.userId);
  }

  // Handle user information update
  @MessagePattern(USER_MESSAGES.updateUser)
  async updateUser(@Payload() updateUser: UpdateUserDTO): Promise<User | null> {
    return this.usersService.updateUser(updateUser);
  }

  // Handle user deletion by ID
  @MessagePattern(USER_MESSAGES.deleteUser)
  async deleteUser(@Payload() userId: number): Promise<boolean> {
    return this.usersService.deleteUser(userId);
  }

  // Handle user login
  @MessagePattern(USER_MESSAGES.userLogin)
  async lofinUser(@Payload() loginUser: LoginUserDTO): Promise<User> {
    return this.usersService.loginUser(loginUser);
  }
}
