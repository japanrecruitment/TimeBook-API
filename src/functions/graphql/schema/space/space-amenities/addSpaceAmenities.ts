import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { isEmpty } from "lodash";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type AddSpaceAmenitiesInput = {
    name: string;
};

type AddSpaceAmenitiesArgs = { input: AddSpaceAmenitiesInput };

type AddSpaceAmenitiesResult = Promise<Result>;

type AddSpaceAmenities = IFieldResolver<any, Context, AddSpaceAmenitiesArgs, AddSpaceAmenitiesResult>;

const addSpaceAmenities: AddSpaceAmenities = async (_, { input }, { dataSources, store }) => {
    let { name } = input;
    name = name.trim();

    if (name && isEmpty(name)) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid title" });

    const newAmenities = await store.spaceAmenities.create({ data: { name } });

    dataSources.redis.deleteMany("space-amenities:*");

    return { message: `Successfully added ${name} space amenities` };
};

export const addSpaceAmenitiesTypeDefs = gql`
    input AddSpaceAmenitiesInput {
        name: String!
    }

    type Mutation {
        addSpaceAmenities(input: AddSpaceAmenitiesInput!): Result! @auth(requires: [admin])
    }
`;

export const addSpaceAmenitiesResolvers = {
    Mutation: { addSpaceAmenities },
};
