import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Product } from './models/product.model';
import { ProductService } from './product.service';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => [Product])
  async products(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Query(() => Product, { nullable: true })
  async product(@Args('id', { type: () => ID }) id: string): Promise<Product> {
    return this.productService.findOne(id);
  }
}
