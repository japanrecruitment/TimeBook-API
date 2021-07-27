import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { merge } from "lodash";
import { accountDirectives, accountResolvers, accountTypeDefs } from "./account";
import { addressTypeDefs } from "./address";
import { spaceTypeDefs, spaceResolvers } from "./space";
import { spaceTypeTypeDefs, spaceTypeResolvers } from "./spacetypes";
import { coreDirectives, coreResolvers, coreTypeDefs } from "./core";

const typeDefs = mergeTypeDefs([coreTypeDefs, accountTypeDefs, addressTypeDefs, spaceTypeDefs, spaceTypeTypeDefs]);

const resolvers = mergeResolvers([coreResolvers, accountResolvers, spaceResolvers, spaceTypeResolvers]);

const schemaDirectives = merge(coreDirectives, accountDirectives);

export default makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives,
});
