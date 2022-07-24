import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../context";
import { CancelPolicyObject, toCancelPolicySelect } from "./CancelPolicyObject";

function validateAddCancelPoliciesInput(input: AddCancelPoliciesInput): AddCancelPoliciesInput {
    let { beforeHours, percentage } = input;

    if (beforeHours < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid before hours" });
    if (percentage < 0 || percentage > 100)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid percentage" });

    return { beforeHours, percentage };
}

function validateAddCancelPoliciesInputList(input: AddCancelPoliciesInput[]): AddCancelPoliciesInput[] {
    return input.map(validateAddCancelPoliciesInput);
}

type AddCancelPoliciesInput = {
    beforeHours: number;
    percentage: number;
};

type AddCancelPoliciesArgs = { spaceId?: string; hotelId?: string; input: AddCancelPoliciesInput[] };

type AddCancelPoliciesResult = CancelPolicyObject[];

type AddCancelPolicies = IFieldResolver<any, Context, AddCancelPoliciesArgs, Promise<AddCancelPoliciesResult>>;

const addCancelPolicies: AddCancelPolicies = async (_, { spaceId, hotelId, input }, { authData, store }, info) => {
    const { accountId } = authData;

    const data = validateAddCancelPoliciesInputList(input);

    const cancelPolicySelect = toCancelPolicySelect(mapSelections(info));

    if (spaceId) {
        const space = await store.space.findUnique({ where: { id: spaceId }, select: { accountId: true } });

        if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

        if (accountId !== space.accountId)
            throw new GqlError({ code: "UNAUTHORIZED", message: "You are not authorized to modify this space" });
    }

    if (hotelId) {
        const hotel = await store.hotel.findUnique({ where: { id: hotelId }, select: { accountId: true } });

        if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

        if (accountId !== hotel.accountId)
            throw new GqlError({ code: "UNAUTHORIZED", message: "You are not authorized to modify this hotel" });
    }

    const cancelPolicies = await Promise.all(
        data.map(({ beforeHours, percentage }) =>
            store.cancelPolicy.create({
                data: {
                    beforeHours,
                    percentage,
                    account: { connect: { id: accountId } },
                    hotels: hotelId ? { connect: { id: hotelId } } : undefined,
                    spaces: spaceId ? { connect: { id: spaceId } } : undefined,
                },
                select: cancelPolicySelect?.select,
            })
        )
    );

    Log("addCancelPolicies", cancelPolicies);

    return cancelPolicies;
};

export const addCancelPoliciesTypeDefs = gql`
    input AddCancelPoliciesInput {
        beforeHours: Float!
        percentage: Float!
    }

    type Mutation {
        addCancelPolicies(spaceId: ID, hotelId: ID, input: [AddCancelPoliciesInput!]!): [CancelPolicyObject]
            @auth(requires: [host])
    }
`;

export const addCancelPoliciesResolvers = { Mutation: { addCancelPolicies } };
