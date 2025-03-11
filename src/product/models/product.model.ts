import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  category_id: number;

  @Field()
  reference_id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  price: number;

  @Field()
  image: string;

  @Field()
  status: number;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
