import { Resolver, Mutation, Arg, Ctx, Query } from "type-graphql";
import { User } from "../entity/User";
import { Request, Response } from "express";
import { UserResponse } from "../graphql-types/UserResponse";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserId } from "../utils";
import { UserInput } from "../graphql-types/UserInput";

const invalidLoginResponse = {
  errors: [
    {
      path: "email",
      message: "invalid login",
    },
  ],
};

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("input")
    { email, username, password }: UserInput
  ): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(password, 12);

    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return {
          errors: [
            {
              path: "email",
              message: "already in use",
            },
          ],
        };
      }
    }
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return {
          errors: [
            {
              path: "username",
              message: "already in use",
            },
          ],
        };
      }
    }

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    }).save();

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
    };

    const token = jwt.sign(
      payload,
      process.env.SESSION_SECRET || "SESSION_SECRET"
    );

    return { user, token };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("input") { username, email, password }: UserInput,
    // prettier-ignore
    @Ctx() ctx: { req: Request, res: Response }
  ): Promise<UserResponse> {
    if (username || email) {
      const user = username
        ? await User.findOne({ where: { username } })
        : await User.findOne({ where: { email } });

      if (!user) {
        return invalidLoginResponse;
      }

      // check for password input
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return invalidLoginResponse;
      }

      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
      };

      ctx.req.session!.userId = user.id;

      const token = jwt.sign(
        payload,
        process.env.SESSION_SECRET || "SESSION_SECRET"
      );
      return { user, token };
    }
    return invalidLoginResponse;
  }

  @Query(() => User)
  async currentUser(
    // prettier-ignore
    @Ctx() ctx: { req: Request, res: Response }
  ): Promise<User | undefined> {
    const userId = getUserId(ctx);
    if (userId) {
      const user = await User.findOne(userId);
      return user;
    }
    throw new Error("User not found");
  }
}
