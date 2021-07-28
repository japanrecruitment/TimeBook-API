import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { merge } from "lodash";
import { accountDirectives, accountResolvers, accountTypeDefs } from "./account";
import { addressTypeDefs } from "./address";
import { coreDirectives, coreResolvers, coreTypeDefs } from "./core";
import { prefectureResolvers, prefectureTypeDefs } from "./prefectures";
import { stationsResolvers, stationsTypeDefs } from "./stations";
import { paymentSourceResolvers, paymentSourceTypeDefs } from "./payment";

const typeDefs = mergeTypeDefs([
    coreTypeDefs,
    accountTypeDefs,
    addressTypeDefs,
    prefectureTypeDefs,
    stationsTypeDefs,
    paymentSourceTypeDefs,
]);

const resolvers = mergeResolvers([
    coreResolvers,
    accountResolvers,
    prefectureResolvers,
    stationsResolvers,
    paymentSourceResolvers,
]);

const schemaDirectives = merge(coreDirectives, accountDirectives);

export default makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives,
});
