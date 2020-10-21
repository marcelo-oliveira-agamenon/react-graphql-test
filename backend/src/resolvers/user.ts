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
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME } from "../constants";

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

    let user: any;
    try {
      const [result] = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: input.username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
      user = {
        id: result.id,
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
