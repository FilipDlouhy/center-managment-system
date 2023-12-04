import { UpdateUserDTO } from './updateUser.dto';

export class UpdateUserRequestDTO {
  data: UpdateUserDTO;
  id: number;

  constructor(userToUpdate: Partial<UpdateUserRequestDTO>) {
    if (!userToUpdate.id || !userToUpdate.data) {
      throw new Error(
        'All required properties (id and userToUpdate) must be provided.',
      );
    }

    // Initialize class properties inside the constructor.
    this.data = new UpdateUserDTO(userToUpdate.data);
    Object.assign(this, userToUpdate);
  }
}
