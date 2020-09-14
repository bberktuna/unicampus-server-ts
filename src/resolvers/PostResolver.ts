import { Post } from "../entity/Post";
import { User } from "../entity/User";
import { PostInput } from "../../src/graphql-types/PostInput";
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Ctx,
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

@Resolver(() => Post)
export class PostResolver {
  @Query(() => Post, { nullable: true })
  async post(@Arg("id") id: number): Promise<Post | undefined> {
    return await Post.findOne(id, { relations: ["user", "comments"] });
  }

  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    const posts = await Post.find({ relations: ["user", "comments"] });
    return posts;
  }
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  @Mutation(() => Post)
  async createPost(
    @Arg("post") postInput: PostInput,
    @Ctx() ctx: { req: Request }
    //@PubSub(Topic.PlaceAdded) publish: Publisher<Place>
  ): Promise<Post> {
    const userId = getUserId(ctx);
    if (userId) {
      const post = plainToClass(Post, {
        text: postInput.text,
        creationDate: new Date(),
      });
      const user = await User.findOne(userId);
      const newPost = await Post.create({
        ...post,
        user,
      }).save();
      //await publish(newPost);
      return newPost;
    }
    throw new Error("User not found");
  }
  @Mutation(() => Post)
  async updatePost(
    @Arg("post") postInput: PostInput,
    @Ctx() ctx: { req: Request }
  ): Promise<Post> {
    const userId = getUserId(ctx);
    if (userId) {
      const { id, text } = postInput;

      const post = await Post.findOne({
        where: { id, user: { id: userId } },
        relations: ["user"],
      });

      if (post) {
        post.text = text;
        post.save();
        return post;
      }
      throw new Error("POST not found");
    }
    throw new Error("USER not found");
  }

  @Mutation(() => String)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() ctx: { req: Request }
  ): Promise<Number | undefined> {
    const userId = getUserId(ctx);
    if (userId) {
      const deleted = await Post.delete({ id, user: { id: userId } });
      if (deleted) {
        return id;
      }
      throw new Error("POST not deleted");
    }
    throw new Error("User not found");
  }
  /*
  @Subscription(() => Post, {
    topics: Topic.PostAdded,
  })
  newPostAdded(
    @Root() post: Post): Post {
    return post;
  }
  */
}
