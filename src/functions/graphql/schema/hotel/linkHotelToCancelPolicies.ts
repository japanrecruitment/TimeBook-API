import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { differenceWith } from "lodash";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../context";
import { Result } from "../core/result";

type LinkHotelToCancelPoliciesArgs = { hotelId: string; cancelPolicyIds: string[] };

type LinkHotelToCancelPoliciesResult = Promise<Result>;

type LinkHotelToCancelPolicies = IFieldResolver<
    any,
    Context,
    LinkHotelToCancelPoliciesArgs,
    LinkHotelToCancelPoliciesResult
>;

const linkHotelToCancelPolicies: LinkHotelToCancelPolicies = async (
    _,
    { hotelId, cancelPolicyIds },
    { authData, store },
    info
) => {
    const { accountId } = authData;

    const hotel = await store.hotel.findUnique({ where: { id: hotelId }, select: { accountId: true } });

    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });

    if (accountId !== hotel.accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "You are not authorized to modify this hotel" });

    const cancelPolices = await store.cancelPolicy.findMany({ where: { id: { in: cancelPolicyIds } } });

    differenceWith(cancelPolicyIds, cancelPolices, (a, b) => a === b.id).forEach((id) => {
        throw new GqlError({ code: "BAD_USER_INPUT", message: `Cancel policy with id ${id} not found` });
    });

    const updateHotel = await Promise.all(
        cancelPolicyIds.map((id) =>
            store.hotel.update({
                where: { id: hotelId },
                data: { cancelPolicies: { connect: { id: id } } },
            })
        )
    );

    Log("linkHotelToCancelPolicies", updateHotel);

    return { message: `Linked hotel to cancel policies` };
};

export const linkHotelToCancelPoliciesTypeDefs = gql`
    type Mutation {
        linkHotelToCancelPolicies(hotelId: ID!, cancelPolicyIds: [ID!]!): Result @auth(requires: [host])
    }
`;

export const linkHotelToCancelPoliciesResolvers = { Mutation: { linkHotelToCancelPolicies } };
