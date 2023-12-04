export class UpdateUserDTO {
  name: string;
  password: string;
  email: string;

  constructor(updateUser: Partial<UpdateUserDTO>) {
    if (
      !updateUser.name ||
      !updateUser.password ||
      !updateUser.email === undefined
    ) {
      throw new Error(
        'All required properties (name, password, email) must be provided.',
      );
    }

    Object.assign(this, updateUser);
  }
}
