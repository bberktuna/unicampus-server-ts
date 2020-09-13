import { InputType, Field } from "type-graphql";

@InputType()
export class CommentInput {
  @Field({ nullable: true })
  id?: number;

  @Field({ nullable: true })
  text?: string; // ? means optional
}
