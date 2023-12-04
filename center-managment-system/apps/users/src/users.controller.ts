import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { USER_MESSAGES } from '@app/rmq';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserDTO } from '@app/database/dtos/userDtos/user.dto';
import { UpdateUserRequestDTO } from '@app/database/dtos/userDtos/updateUserRequest.dto';
import { LoginUserDTO } from '@app/database/dtos/userDtos/loginUser.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Handle user creation
  @MessagePattern(USER_MESSAGES.createUser)
  async createUser(@Payload() data: UserDTO) {
    return this.usersService.createUser(data);
  }

  // Handle getting all users
  @MessagePattern(USER_MESSAGES.getAllUsers)
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  // Handle getting a user by ID
  @MessagePattern(USER_MESSAGES.getUser)
  async getUser(@Payload() userId: number) {
    return this.usersService.getUser(userId);
  }

  // Handle user information update
  @MessagePattern(USER_MESSAGES.updateUser)
  async updateUser(@Payload() updateUser: UpdateUserRequestDTO) {
    return this.usersService.updateUser(updateUser);
  }

  // Handle user deletion by ID
  @MessagePattern(USER_MESSAGES.deleteUser)
  async deleteUser(@Payload() userId: number) {
    return this.usersService.deleteUser(userId);
  }

  // Handle user login
  @MessagePattern(USER_MESSAGES.userLogin)
  async lofinUser(@Payload() loginUser: LoginUserDTO) {
    return this.usersService.loginUser(loginUser);
  }
}
