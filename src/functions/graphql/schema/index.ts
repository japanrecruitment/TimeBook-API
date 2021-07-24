import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { merge } from "lodash";
import { accountDirectives, accountResolvers, accountTypeDefs } from "./account";
import { addressTypeDefs } from "./address";
import { coreDirectives, coreResolvers, coreTypeDefs } from "./core";

const typeDefs = mergeTypeDefs([coreTypeDefs, accountTypeDefs, addressTypeDefs]);

const resolvers = mergeResolvers([coreResolvers, accountResolvers]);

const schemaDirectives = merge(coreDirectives, accountDirectives);

export default makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives,
});
