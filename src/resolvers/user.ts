import { MyContext } from "src/types";
import { Resolver, Ctx, Arg, Mutation, InputType, Field } from "type-graphql";
import { User } from "../entities/User";
import argon from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class UserResolvers {
  @Mutation(() => User)
  async register(
    @Arg("input") input: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ) {
    const hashedPassword = await argon.hash(input.password);
    const user = em.create(User, {
      username: input.username,
      password: hashedPassword,
    });
    await em.persistAndFlush(user);
    return user;
  }

  @Mutation(() => User)
  async login(
    @Arg("input") input: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ) {
    const hashedPassword = await argon.hash(input.password);
    const user = em.create(User, {
      username: input.username,
      password: hashedPassword,
    });
    await em.persistAndFlush(user);
    return user;
  }
}
