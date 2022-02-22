import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { isEmpty } from "lodash";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type UpdateSpaceAmenitiesInput = {
    id: string;
    name?: string;
};

type UpdateSpaceAmenitiesArgs = { input: UpdateSpaceAmenitiesInput };

type UpdateSpaceAmenitiesResult = Promise<Result>;

type UpdateSpaceAmenities = IFieldResolver<any, Context, UpdateSpaceAmenitiesArgs, UpdateSpaceAmenitiesResult>;

const updateSpaceAmenities: UpdateSpaceAmenities = async (_, { input }, { dataSources, store }) => {
    let { id, name } = input;
    name = name?.trim();

    if (name && isEmpty(name)) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid title" });

    const amenities = await store.spaceAmenities.findUnique({ where: { id } });

    if (!amenities) throw new GqlError({ code: "BAD_REQUEST", message: "Space Amenities not found!" });

    const updatedAmenities = await store.spaceAmenities.update({ where: { id }, data: { name } });

    dataSources.redis.deleteMany("space-amenities:*");

    return { message: `Successfully updated ${name} space amenities` };
};

export const updateSpaceAmenitiesTypeDefs = gql`
    input UpdateSpaceAmenitiesInput {
        id: ID!
        name: String
    }

    type Mutation {
        updateSpaceAmenities(input: UpdateSpaceAmenitiesInput!): Result! @auth(requires: [admin])
    }
`;

export const updateSpaceAmenitiesResolvers = {
    Mutation: { updateSpaceAmenities },
};
