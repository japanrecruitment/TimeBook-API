import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { merge } from "lodash";
import { accountResolvers, accountTypeDefs } from "./account";
import { addressTypeDefs } from "./address";
import { spaceTypeDefs, spaceResolvers } from "./space";
import { coreDirectives, coreResolvers, coreTypeDefs } from "./core";
import { prefectureResolvers, prefectureTypeDefs } from "./prefectures";
import { stationsResolvers, stationsTypeDefs } from "./stations";
import { paymentSourceResolvers, paymentSourceTypeDefs } from "./payment";
import { mediaTypeDefs, mediaResolvers } from "./media";
import { cacheResolvers, cacheTypeDefs } from "./cache";

const typeDefs = mergeTypeDefs([
    coreTypeDefs,
    cacheTypeDefs,
    accountTypeDefs,
    addressTypeDefs,
    paymentSourceTypeDefs,
    prefectureTypeDefs,
    stationsTypeDefs,
    spaceTypeDefs,
    mediaTypeDefs,
]);

const resolvers = mergeResolvers([
    coreResolvers,
    cacheResolvers,
    accountResolvers,
    paymentSourceResolvers,
    prefectureResolvers,
    stationsResolvers,
    spaceResolvers,
    mediaResolvers,
]);

const schemaDirectives = merge(coreDirectives);

export default makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives,
});
