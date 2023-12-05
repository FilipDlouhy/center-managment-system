import { generateRandomId } from '@app/common';

export class CreateUserDTO {
  id: number;
  name: string;
  password: string;
  email: string;
  admin: boolean;

  constructor(user: Partial<CreateUserDTO>) {
    if (
      !user.name ||
      !user.password ||
      !user.email ||
      user.admin === undefined
    ) {
      throw new Error(
        'All required properties (name, password, email, admin) must be provided.',
      );
    }
    this.id = generateRandomId();

    // `centerId` and `tasks` are not included in the mandatory fields check.
    // They can be undefined if not provided.

    Object.assign(this, user);
  }
}
