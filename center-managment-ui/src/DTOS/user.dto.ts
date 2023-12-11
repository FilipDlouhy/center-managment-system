import { TaskDto } from "./task.dto";
export class UserDto {
  id?: number;
  name!: string;
  password!: string;
  email!: string;
  tasks?: TaskDto[];
  admin!: boolean;

  constructor(user: Partial<UserDto>) {
    Object.assign(this, user);
  }
}
