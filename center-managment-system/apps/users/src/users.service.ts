import { LoginUserDTO } from '@app/database/dtos/userDtos/loginUser.dto';
import { CreateUserDTO } from '@app/database/dtos/userDtos/createUser.dto';
import { User } from '@app/database/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TASK_MESSAGES, TASK_QUEUE } from '@app/rmq/rmq.task.constants';
import { ClientProxy } from '@nestjs/microservices';
import { UpdateUserDTO } from '@app/database/dtos/userDtos/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
    @Inject(TASK_QUEUE.serviceName)
    private readonly taskClient: ClientProxy,
  ) {}

  /**
   * Creates a new user in the database.
   * @param data The data for the new user.
   * @returns The created UserDTO.
   * @throws BadRequestException If the provided data is invalid or email already exists.
   */
  async createUser(data: CreateUserDTO): Promise<User> {
    try {
      const userDto = new CreateUserDTO(data);
      userDto.password = await bcrypt.hash(userDto.password, 10);
      const user = new User(userDto);
      await this.entityManager.save(user);
      delete user.password;
      return user;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const errorCode = (error as any).code;

        if (errorCode === 'ER_DUP_ENTRY') {
          throw new BadRequestException('Email already exists.');
        }
      }

      throw new BadRequestException(
        'Invalid user data. Please provide all required fields.',
      );
    }
  }

  /**
   * Retrieves all users from the database.
   * @returns An array of UserDTOs.
   * @throws InternalServerErrorException If there's an error during retrieval.
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        where: { admin: false },
        select: ['id', 'name', 'email', 'admin'],
      });

      if (!users) {
        throw new InternalServerErrorException('No users found');
      }

      return users;
    } catch (error) {
      console.error('Error while finding users:', error);

      throw new InternalServerErrorException('Error while finding users');
    }
  }

  /**
   * Retrieves a single user by their ID.
   * @param id The ID of the user to retrieve.
   * @returns The UserDTO of the retrieved user.
   * @throws BadRequestException If the ID is invalid.
   * @throws NotFoundException If the user is not found.
   */
  async getUser(id: number): Promise<User> {
    try {
      if (isNaN(id) || id <= 0) {
        throw new BadRequestException('Invalid user ID');
      }

      const user = await this.userRepository.findOne({
        where: { id },
        relations: { tasks: true },
        select: ['id', 'name', 'email', 'admin'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error while finding user:', error);

      throw new InternalServerErrorException('Error while finding user');
    }
  }

  /**
   * Updates a user's information in the database.
   * @param updateUserDto The DTO containing the user's updated information.
   * @returns The updated UserDTO or null if not updated.
   * @throws BadRequestException If the provided ID is invalid.
   * @throws NotFoundException If the user is not found.
   */
  async updateUser(updateUserDto: UpdateUserDTO): Promise<User | null> {
    try {
      if (isNaN(updateUserDto.id) || updateUserDto.id <= 0) {
        throw new BadRequestException('Invalid user ID');
      }

      const updatedUser = await this.entityManager.transaction(
        async (transactionalEntityManager) => {
          const user = await this.userRepository.findOne({
            where: { id: updateUserDto.id },
            select: ['id', 'name', 'email', 'admin'],
          });

          if (!user) {
            throw new NotFoundException('User not found');
          }

          // Updating user fields if provided
          if (updateUserDto.email && updateUserDto.email.length > 0) {
            user.email = updateUserDto.email;
          }
          if (updateUserDto.password && updateUserDto.password.length > 0) {
            user.password = await bcrypt.hash(updateUserDto.password, 10);
          }
          if (updateUserDto.name && updateUserDto.name.length > 0) {
            user.name = updateUserDto.name;
          }

          await transactionalEntityManager.save(user);

          return user;
        },
      );

      return updatedUser;
    } catch (error) {
      console.error('Error while updating user:', error);

      throw new InternalServerErrorException(
        'Error while updating user: ' + error.message,
      );
    }
  }

  /**
   * Deletes a user from the database.
   * @param id The ID of the user to delete.
   * @returns A boolean indicating whether the deletion was successful.
   * @throws NotFoundException If the user is not found.
   * @throws InternalServerErrorException If there's an error during deletion.
   */
  async deleteUser(id: number): Promise<boolean> {
    try {
      // Check if there are ongoing tasks for the user
      const deleteTasksWithoutUser = await this.taskClient
        .send(TASK_MESSAGES.deleteTasksWithoutUser, { userId: id })
        .toPromise();

      if (!deleteTasksWithoutUser) {
        throw new Error('User has ongoing tasks. Deletion not allowed.');
      }

      const result = await this.userRepository.delete(id);

      if (result.affected && result.affected > 0 && deleteTasksWithoutUser) {
        return true;
      } else {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      console.error('Error while deleting user:', error);

      throw new InternalServerErrorException(
        'Error while deleting user: ' + error.message,
      );
    }
  }

  /**
   * Login a user by comparing the provided credentials with stored user data.
   * @param loginUserDto An object containing the email and password for login.
   * @returns A UserDTO representing the authenticated user.
   * @throws NotFoundException If the user is not found.
   * @throws InternalServerErrorException If there's an error during login.
   */
  async loginUser(loginUserDto: LoginUserDTO): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginUserDto.email },
        select: ['id', 'name', 'email', 'admin', 'password'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const passwordMatchResult = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );

      if (passwordMatchResult) {
        delete user.password;
        return user;
      } else {
        throw new InternalServerErrorException('Wrong password');
      }
    } catch (error) {
      console.error('Error during login:', error);

      throw new InternalServerErrorException(
        'Error during login: ' + error.message,
      );
    }
  }
}
