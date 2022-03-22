import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { merge } from "lodash";
import { accountResolvers, accountTypeDefs } from "./account";
import { addressResolvers, addressTypeDefs } from "./address";
import { spaceTypeDefs, spaceResolvers } from "./space";
import { coreDirectives, coreResolvers, coreTypeDefs } from "./core";
import * as payment from "./payment";
import { prefectureResolvers, prefectureTypeDefs } from "./prefectures";
import { stationsResolvers, stationsTypeDefs } from "./stations";
import { mediaTypeDefs, mediaResolvers } from "./media";
import { cacheResolvers, cacheTypeDefs } from "./cache";
import * as chat from "./chat";
import * as reservation from "./reservation";
import * as transaction from "./transaction";

const typeDefs = mergeTypeDefs([
    coreTypeDefs,
    cacheTypeDefs,
    accountTypeDefs,
    addressTypeDefs,
    payment.typeDefs,
    prefectureTypeDefs,
    stationsTypeDefs,
    spaceTypeDefs,
    mediaTypeDefs,
    chat.typeDefs,
    reservation.typeDefs,
    transaction.typeDefs,
]);

const resolvers = mergeResolvers([
    coreResolvers,
    cacheResolvers,
    accountResolvers,
    addressResolvers,
    payment.resolvers,
    prefectureResolvers,
    stationsResolvers,
    spaceResolvers,
    mediaResolvers,
    chat.resolvers,
    reservation.resolvers,
    transaction.resolvers,
]);

const schemaDirectives = merge(coreDirectives);

export default makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives,
});
