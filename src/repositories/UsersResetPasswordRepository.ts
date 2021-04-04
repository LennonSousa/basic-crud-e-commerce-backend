import { EntityRepository, Repository } from 'typeorm';
import UsersResetPasswordModel from '../models/UsersResetPasswordModel';

@EntityRepository(UsersResetPasswordModel)
class UsersResetPasswordRepository extends Repository<UsersResetPasswordModel> { }

export { UsersResetPasswordRepository }