export class UpdateUserDTO {
  name: string;
  password: string;
  email: string;
  id: number;

  constructor(updateUser: Partial<UpdateUserDTO>) {
    if (
      !updateUser.name ||
      !updateUser.id ||
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
