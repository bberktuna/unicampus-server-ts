import { InputType, Field } from "type-graphql";

@InputType()
export class UserInput {
  @Field({ nullable: true })
  email?: string; // ? means optional

  @Field({ nullable: true })
  username?: string;

  @Field()
  password: string;
}
