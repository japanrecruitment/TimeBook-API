import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { giveRatingResolvers, giveRatingTypeDefs } from "./give-rating";
import { ratingObjectTypeDefs } from "./RatingObject";

export const ratingsTypeDefs = mergeTypeDefs([ratingObjectTypeDefs, giveRatingTypeDefs]);

export const ratingResolvers = mergeResolvers([giveRatingResolvers]);
