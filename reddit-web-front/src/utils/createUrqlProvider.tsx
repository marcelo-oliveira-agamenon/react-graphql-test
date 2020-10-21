import { cacheExchange } from "@urql/exchange-graphcache";
import { dedupExchange, fetchExchange } from "urql";
import {
  LogoutMutation,
  MeQuery,
  MeDocument,
  LoginMutation,
  RegisterMutation,
} from "../generated/graphql";
import { betterQueryType } from "./betterQueryType";

export const urqlClient = (ssrExchange: any) => ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logout: (_result, args, cache, info) => {
            betterQueryType<LogoutMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({
                me: null,
              })
            );
          },

          login: (_result, args, cache, info) => {
            betterQueryType<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (_result, query) => {
                if (_result.login.errors) {
                  return query;
                } else {
                  return {
                    me: _result.login.user,
                  };
                }
              }
            );
          },

          register: (_result, args, cache, info) => {
            betterQueryType<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (_result, query) => {
                if (_result.register.errors) {
                  return query;
                } else {
                  return {
                    me: _result.register.user,
                  };
                }
              }
            );
          },
        },
      },
    }),
    ssrExchange,
    fetchExchange,
  ],
});
