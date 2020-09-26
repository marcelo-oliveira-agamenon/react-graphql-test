import { MyContext } from "src/types";
import {
  Resolver,
  Ctx,
  Arg,
  Mutation,
  InputType,
  Field,
  ObjectType,
  Query,
} from "type-graphql";
import { User } from "../entities/User";
import argon from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

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
    if (input.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "short username field length",
          },
        ],
      };
    }
    if (input.password.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "short password field length",
          },
        ],
      };
    }

    const hashedPassword = await argon.hash(input.password);
    const user = em.create(User, {
      username: input.username,
      password: hashedPassword,
    });
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === "23505") {
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
    @Arg("input") input: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: input.username });
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Username doesn't exist",
          },
        ],
      };
    }
    const passwordCompare = await argon.verify(user.password, input.password);
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
}