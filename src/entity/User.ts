import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Post } from "./Post";
import { Comment } from "./Comment";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Field()
  @Column("text", { unique: true }) //default data type is text
  email: string;

  @Field()
  @Column("text", { unique: true })
  username: string;

  @Column()
  password: string;

  @Field(() => [Post])
  @OneToMany(() => Post, (posts) => posts.user)
  posts: Post[];

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comments) => comments.user)
  comments: Comment[];
}
