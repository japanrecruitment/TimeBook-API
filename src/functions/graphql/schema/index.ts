import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { merge } from "lodash";
import { accountDirectives, accountResolvers, accountTypeDefs } from "./account";
import { addressTypeDefs } from "./address";
import { spaceTypeDefs, spaceResolvers } from "./space";
import { spaceTypesTypeDefs, spaceTypesResolvers } from "./spacetypes";
import { coreDirectives, coreResolvers, coreTypeDefs } from "./core";
import { prefectureResolvers, prefectureTypeDefs } from "./prefectures";
import { stationsResolvers, stationsTypeDefs } from "./stations";
import { paymentSourceResolvers, paymentSourceTypeDefs } from "./payment";
// import { uploadTokenTypeDefs, uploadTokenResolvers } from "./medias";
import { mediaTypeDefs, mediaResolvers } from "./media";

const typeDefs = mergeTypeDefs([
    coreTypeDefs,
    accountTypeDefs,
    addressTypeDefs,
    paymentSourceTypeDefs,
    prefectureTypeDefs,
    stationsTypeDefs,
    spaceTypeDefs,
    spaceTypesTypeDefs,
    mediaTypeDefs,
]);

const resolvers = mergeResolvers([
    coreResolvers,
    accountResolvers,
    paymentSourceResolvers,
    prefectureResolvers,
    stationsResolvers,
    spaceResolvers,
    spaceTypesResolvers,
    mediaResolvers,
]);

const schemaDirectives = merge(coreDirectives, accountDirectives);

export default makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives,
});
