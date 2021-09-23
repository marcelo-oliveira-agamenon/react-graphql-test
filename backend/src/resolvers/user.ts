import { MyContext } from "src/types";
import {
  Resolver,
  Ctx,
  Arg,
  Mutation,
  Field,
  ObjectType,
  Query,
} from "type-graphql";
import { v4 } from "uuid";
import { User } from "../entities/User";
import argon from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";

@ObjectType()
class FieldError {
  @Field()
  field: String;

  @Field()
  message: String;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolvers {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, em }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "short password field length",
          },
        ],
      };
    }

    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);

    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token its not valid or expired",
          },
        ],
      };
    }

    const user = await em.findOne(User, { id: parseInt(userId) });

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user doenst exist",
          },
        ],
      };
    }

    user.password = await argon.hash(newPassword);
    await em.persistAndFlush(user);

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const person = await em.findOne(User, { email });

    if (!person) {
      return true;
    }

    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      person.id,
      "ex",
      1000 * 60 * 60 * 24
    );

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("input") input: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(input);

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon.hash(input.password);

    let user: any;
    try {
      const [result] = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: input.username,
          email: input.email,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
      user = {
        id: result.id,
        email: result.email,
        username: result.username,
        password: result.password,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    } catch (error) {
      if (error.detail.includes("already exists")) {
        //duplicate error
        return {
          errors: [
            {
              field: "username",
              message: "username already exists in database",
            },
          ],
        };
      }
    }

    return {
      user: user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "Username doesn't exist",
          },
        ],
      };
    }
    const passwordCompare = await argon.verify(user.password, password);
    if (!passwordCompare) {
      return {
        errors: [
          {
            field: "password",
            message: "Wrong Password",
          },
        ],
      };
    }

    req.session.userId = user.id;

    return {
      user: user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((_res) => {
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          _res(false);
          return;
        }

        _res(true);
      });
    });
  }
}
