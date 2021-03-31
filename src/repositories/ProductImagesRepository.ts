import { EntityRepository, Repository } from 'typeorm';
import ProductImagesModel from '../models/ProductImagesModel';

@EntityRepository(ProductImagesModel)
export default class ProductImagesRepository extends Repository<ProductImagesModel> { }