import { generateRandomId } from '@app/common';

export class UserDTO {
  id: number;
  name: string;
  password: string;
  email: string;
  admin: boolean;

  constructor(user: Partial<UserDTO>) {
    if (
      !user.name ||
      !user.password ||
      !user.email ||
      user.admin === undefined
    ) {
      throw new Error(
        'All required properties (name, password, email) must be providedasfasfasasfasfasfasf.',
      );
    }
    this.id = generateRandomId();

    Object.assign(this, user);
  }
}
