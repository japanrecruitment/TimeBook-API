import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { CancelPolicyObject, toCancelPolicySelect } from "./CancelPolicyObject";

type CancelPolicyByIdArgs = { id: string };

type CancelPolicyByIdResult = CancelPolicyObject;

type CancelPolicyById = IFieldResolver<any, Context, CancelPolicyByIdArgs, Promise<CancelPolicyByIdResult>>;

const cancelPolicyById: CancelPolicyById = async (_, { id }, { authData, store }, info) => {
    const { accountId } = authData;

    id = id?.trim();
    if (isEmpty(id)) throw new GqlError({ code: "BAD_REQUEST", message: "Please provide cancel policy id" });

    const cancelPolicySelect = toCancelPolicySelect(mapSelections(info))?.select;
    const cancelPolicy = await store.cancelPolicy.findFirst({ where: { id, accountId }, select: cancelPolicySelect });
    if (!cancelPolicy) throw new GqlError({ code: "NOT_FOUND", message: "Cancel policy not found" });

    Log("cancelPolicyById", cancelPolicy);

    return cancelPolicy;
};

export const cancelPolicyByIdTypeDefs = gql`
    type Query {
        cancelPolicyById(id: ID!): CancelPolicyObject @auth(requires: [host])
    }
`;

export const cancelPolicyByIdResolvers = { Query: { cancelPolicyById } };
