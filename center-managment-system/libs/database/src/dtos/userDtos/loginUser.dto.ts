export class LoginUserDTO {
  password: string;
  email: string;

  constructor(updateUser: Partial<LoginUserDTO>) {
    if (!updateUser.password || !updateUser.email === undefined) {
      throw new Error(
        'All required properties (name, password, email) must be provided.',
      );
    }

    Object.assign(this, updateUser);
  }
}
