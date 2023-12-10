export class LoginUserDTO {
  password!: string;
  email!: string;

  constructor(updateUser: Partial<LoginUserDTO>) {
    Object.assign(this, updateUser);
  }
}
