import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { RatingObject } from "./RatingObject";

type GiveRatingInput = {
    spaceId: string;
    rating: number;
    comment?: string;
};

type GiveRatingArgs = { input: GiveRatingInput };

type GiveRatingResult = Promise<RatingObject>;

type GiveRating = IFieldResolver<any, Context, GiveRatingArgs, GiveRatingResult>;

const giveRating: GiveRating = async (_, { input }, { authData, store }) => {
    const { accountId } = authData;

    const { rating, spaceId, comment } = input;

    const space = await store.space.findUnique({
        where: { id: spaceId },
        select: {
            accountId: true,
            ratings: { where: { byAccountId: accountId }, select: { id: true } },
            reservations: {
                where: { reserveeId: accountId, status: "RESERVED" },
                orderBy: { toDateTime: "asc" },
                select: { toDateTime: true },
            },
        },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "スペースが見つかりません" });

    if (accountId === space.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    if (space.ratings && space.ratings.length > 0) {
        const previousRatingId = space.ratings[0].id;
        const updatedRating = await store.rating.update({ where: { id: previousRatingId }, data: { rating, comment } });
        return updatedRating;
    }

    if (!space.reservations || space.reservations.length <= 0)
        throw new GqlError({
            code: "FORBIDDEN",
            message: "評価とレビューを行う前に予約する必要があります",
        });

    if (space.reservations[0].toDateTime.getTime() >= Date.now())
        throw new GqlError({ code: "FORBIDDEN", message: "評価とレビューを行う前に予約を完了する必要があります" });

    const newRating = await store.rating.create({
        data: { rating, comment, byAccount: { connect: { id: accountId } }, space: { connect: { id: spaceId } } },
    });

    Log("giveRating: ", newRating);

    return newRating;
};

export const giveRatingTypeDefs = gql`
    input GiveRatingInput {
        spaceId: ID!
        rating: Float!
        comment: String
    }

    type Mutation {
        giveRating(input: GiveRatingInput!): RatingObject @auth(requires: [user, host])
    }
`;

export const giveRatingResolvers = { Mutation: { giveRating } };
