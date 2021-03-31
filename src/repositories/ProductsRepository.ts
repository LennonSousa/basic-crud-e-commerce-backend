import { EntityRepository, Repository } from 'typeorm';
import ProductsModel from '../models/ProductsModel';

@EntityRepository(ProductsModel)
export default class ProductsRepository extends Repository<ProductsModel> { }