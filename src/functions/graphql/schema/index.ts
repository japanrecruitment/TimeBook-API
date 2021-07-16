import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { merge } from "lodash";
import { accountResolvers, accountTypeDefs } from "./account";
import { coreDirectives, coreTypeDefs } from "./core";

const typeDefs = mergeTypeDefs([coreTypeDefs, accountTypeDefs]);

const resolvers = mergeResolvers([accountResolvers]);

const schemaDirectives = merge(coreDirectives);

export default makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives,
});
