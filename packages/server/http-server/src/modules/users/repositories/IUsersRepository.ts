import { User, UserEmail } from '@modules/users/entities';

export interface IUsersRepository {
  create(user: User): Promise<User>;
  findByEmail(email: UserEmail): Promise<User | null>;
}
