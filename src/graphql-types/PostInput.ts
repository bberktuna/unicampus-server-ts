import { InputType, Field } from "type-graphql";

@InputType()
export class PostInput {
  @Field({ nullable: true })
  id?: number;

  @Field()
  text: string;

  /*
    @Field({ nullable: true})
    imageUrl?: string
  */
}
