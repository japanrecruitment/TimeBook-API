import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { GqlError } from "../../error";
import { Context } from "../../context";
import { Result } from "../core/result";
import { isEmpty } from "lodash";

type RemoveCancelPolicyArgs = { id: string };

type RemoveCancelPolicyResult = Promise<Result>;

type RemoveCancelPolicy = IFieldResolver<any, Context, RemoveCancelPolicyArgs, RemoveCancelPolicyResult>;

const removeCancelPolicy: RemoveCancelPolicy = async (_, { id }, { authData, store }) => {
    const { accountId } = authData;

    id = id?.trim();
    if (isEmpty(id)) throw new GqlError({ code: "BAD_REQUEST", message: "Please provide cancel policy id" });

    const cancelPolicy = await store.cancelPolicy.findUnique({
        where: { id },
        select: { accountId: true },
    });

    if (!cancelPolicy) throw new GqlError({ code: "NOT_FOUND", message: "Cancel policy not found" });

    if (accountId !== cancelPolicy.accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "You are not authorized to modify this cancel policy" });

    await store.cancelPolicy.delete({ where: { id } });

    return { message: "Successfully removed a cancel policy" };
};

export const removeCancelPolicyTypeDefs = gql`
    type Mutation {
        removeCancelPolicy(id: ID!): Result @auth(requires: [host])
    }
`;

export const removeCancelPolicyResolvers = { Mutation: { removeCancelPolicy } };
