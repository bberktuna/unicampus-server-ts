import { Post } from "../entity/Post";
import { User } from "../entity/User";
import { Comment } from "../entity/Comment";
import { CommentInput } from "./../graphql-types/CommentInput";

import {
  Resolver,
  Arg,
  Mutation,
  Ctx,
  Query,
  //Root,
  //Subscription,
} from "type-graphql";
import { plainToClass } from "class-transformer";
import { getUserId } from "../utils";
import { Request } from "express";

/*
enum Topic {
  PlaceAdded = "NEW_PLACE_ADDED",
}
*/

@Resolver(() => Comment)
export class CommentResolver {
  @Query(() => [Comment])
  async comments(): Promise<Comment[]> {
    const comments = await Comment.find({ relations: ["user", "post"] });
    return comments;
  }

  @Query(() => Comment, { nullable: true })
  async comment(@Arg("id") id: number): Promise<Comment | undefined> {
    return await Comment.findOne(id, { relations: ["user", "post"] });
  }

  @Mutation(() => Comment)
  async createComment(
    @Arg("comment") commentInput: CommentInput,
    @Arg("id") id: number,
    @Ctx() ctx: { req: Request }
  ): Promise<Comment | Number | Post> {
    const userId = getUserId(ctx);

    if (userId) {
      /*
      const post = Post.findOne({
        where:  [postt.id, { user: { id: userId } }],
        relations: ["user", "post"],
      });
      */
      const postId = Post.findOne({ id, user: { id: userId } });

      if (postId) {
        const comment = plainToClass(Comment, {
          text: commentInput.text,
          creationDate: new Date(),
        });
        const user = await User.findOne(userId);
        const post = await Post.findOne({ id, user: { id: userId } });
        const newComment = await Comment.create({
          ...comment,
          user,
          post,
        }).save();
        return newComment;
      }
      throw new Error("POST NOT FOUND");
    }
    throw new Error("User Not Found");
  }
}
