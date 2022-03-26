import { Rating } from "@prisma/client";
import { gql } from "apollo-server-core";
import { PrismaSelect, toPrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";

export type RatingObject = Partial<Rating>;

export type RatingSelect = {
    id: boolean;
    rating: boolean;
    comment: boolean;
    spaceId: boolean;
    byAccountId: boolean;
    createdAt: boolean;
    updatedAt: boolean;
};

export const toRatingSelect = (selections, defaultValue: any = false): PrismaSelect<RatingSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    return toPrismaSelect(selections);
};

export const ratingObjectTypeDefs = gql`
    type RatingObject {
        id: ID
        rating: Float
        comment: String
        spaceId: String
        byAccountId: String
        createdAt: Date
        updatedAt: Date
    }
`;
