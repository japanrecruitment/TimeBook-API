import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { IFieldResolver } from "@graphql-tools/utils";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { UpdateSpacePricePlanInput } from "./spacePricePlan";

type UpdateSpaceInput = {
    id: string;
    name?: string;
    maximumCapacity?: number;
    numberOfSeats?: number;
    spaceSize?: number;
    spacePricePlan?: UpdateSpacePricePlanInput;
    spaceTypes?: string[];
};

type UpdateMySpace = IFieldResolver<any, Context, Record<"input", UpdateSpaceInput>, Promise<Result>>;

const updateMySpace: UpdateMySpace = async (_, { input }, { authData, store }) => {
    const { accountId } = authData;
    const { id, spacePricePlan, spaceTypes, ...spaceData } = input;

    const space = await store.space.findUnique({
        where: { id },
        select: { accountId: true, spaceTypes: { select: { spaceTypeId: true } } },
    });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    const prevSpaceTypes = space.spaceTypes.map(({ spaceTypeId }) => spaceTypeId);

    const spaceTypesToAdd = spaceTypes
        .filter((id) => !prevSpaceTypes.includes(id))
        .map((spaceTypeId) => ({ spaceTypeId }));

    const spaceTypesToDelete = prevSpaceTypes.filter((id) => !spaceTypes.includes(id));

    await store.space.update({
        where: { id },
        data: {
            ...spaceData,
            spacePricePlans: { update: spacePricePlan },
            spaceTypes: {
                deleteMany: { spaceTypeId: { in: spaceTypesToDelete }, spaceId: id },
                createMany: { data: spaceTypesToAdd },
            },
        },
    });

    return { message: `Successfully added space` };
};

export const updateMySpaceTypeDefs = gql`
    input UpdateMySpaceInput {
        id: ID!
        name: String
        maximumCapacity: Int
        numberOfSeats: Int
        spaceSize: Float
        spacePricePlan: UpdateSpacePricePlanInput
        spaceTypes: [ID]
    }

    type Mutation {
        updateMySpace(input: UpdateSpaceTypeInput!): Result! @auth(requires: [user, host])
    }
`;

export const updateMySpaceResolvers = {
    Mutation: { updateMySpace },
};
