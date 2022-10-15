import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import {
    createPaginationResult,
    createPaginationResultType,
    PaginationOption,
    PaginationResult,
} from "../core/pagination";
import { CancelPolicyObject, toCancelPolicySelect } from "./CancelPolicyObject";

type MyCancelPoliciesArgs = { hotelId?: string; spaceId?: string; paginate?: PaginationOption };

type MyCancelPoliciesResult = PaginationResult<CancelPolicyObject>;

type MyCancelPolicies = IFieldResolver<any, Context, MyCancelPoliciesArgs, Promise<MyCancelPoliciesResult>>;

const myCancelPolicies: MyCancelPolicies = async (_, { hotelId, spaceId, paginate }, { authData, store }, info) => {
    const { accountId } = authData;

    const { skip, take } = paginate || {};

    const cancelPolicySelect = toCancelPolicySelect(mapSelections(info)?.data)?.select;
    const cancelPolices = await store.cancelPolicy.findMany({
        where: {
            accountId,
            hotels: hotelId ? { some: { id: hotelId } } : undefined,
            spaces: spaceId ? { some: { id: spaceId } } : undefined,
        },
        select: cancelPolicySelect,
        take: take && take + 1,
        skip,
    });

    Log("myCancelPolicies", cancelPolices);

    return createPaginationResult(cancelPolices, take, skip);
};

export const myCancelPoliciesTypeDefs = gql`
    ${createPaginationResultType("MyCancelPoliciesResult", "CancelPolicyObject")}

    type Query {
        myCancelPolicies(hotelId: ID, spaceId: ID, paginate: PaginationOption): MyCancelPoliciesResult
            @auth(requires: [host])
    }
`;

export const myCancelPoliciesResolvers = { Query: { myCancelPolicies } };
