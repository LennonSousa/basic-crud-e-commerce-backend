import { EntityRepository, Repository } from 'typeorm';
import ProductsModel from '../models/ProductsModel';

@EntityRepository(ProductsModel)
class ProductsRepository extends Repository<ProductsModel> { }

export { ProductsRepository };

