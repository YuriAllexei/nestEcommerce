import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUid } from 'uuid';
import { ProductImage } from './entities/product-image.entity';



@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) {

  }



  async create(createProductDto: CreateProductDto) {
    try {

      const { images = [], ...product } = createProductDto;

      const producto = this.productRepository.create({
        ...product,
        images: images.map(image => this.productImageRepository.create({ url: image })),
      });
      await this.productRepository.save(producto);
      return { ...producto, images };

    } catch (error) {
      this.handleError(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    const product = await this.productRepository.find({
      skip: offset,
      take: limit,
      relations: {
        images: true,
      }
    });

    return product.map(product => ({
      ...product,
      images: product.images.map(image => image.url),
    }));
  }

  async findOne(id: string) {

    let product: Product;

    if (isUUid(id)) {
      product = await this.productRepository.findOneBy({ id });
    } else {
      const query = this.productRepository.createQueryBuilder('product');
      product = await query.where('LOWER(title) =:title or slug =:slug', { title: id.toLowerCase(), slug: id.toLowerCase() }).leftJoinAndSelect('product.images', 'prodImages').getOne();
    }


    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product
  }

  async findOnePlain(id: string) {
    const { images = [], ...product } = await this.findOne(id);
    return {
      ...product,
      images: images.map(image => image.url),
    }
  }


  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    //Create QueryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    //Start a transaction
    await queryRunner.startTransaction();

    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map(image => this.productImageRepository.create({ url: image }));
      }

      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return await this.findOnePlain(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleError(error);
    }

  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return product;
  }

  private handleError(error: any) {

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error);
    throw new InternalServerErrorException('Error del servidor');

  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {

      await query.delete().where({}).execute();
      return true;

    } catch (error) {
      this.handleError(error);
    }
  }
}