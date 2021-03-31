import { EntityRepository, Repository } from 'typeorm';
import UsersModel from '../models/UsersModel';

@EntityRepository(UsersModel)
export default class UsersRepository extends Repository<UsersModel> { }