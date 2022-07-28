import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { GqlError } from "../../error";
import { Context } from "../../context";
import { Result } from "../core/result";
import { isEmpty } from "lodash";

type RemoveOptionArgs = { id: string };

type RemoveOptionResult = Promise<Result>;

type RemoveOption = IFieldResolver<any, Context, RemoveOptionArgs, RemoveOptionResult>;

const removeOption: RemoveOption = async (_, { id }, { authData, store }) => {
    const { accountId } = authData;

    id = id?.trim();
    if (isEmpty(id)) throw new GqlError({ code: "BAD_REQUEST", message: "Please provide remove id" });

    const option = await store.option.findUnique({
        where: { id },
        select: { accountId: true },
    });

    if (!option) throw new GqlError({ code: "NOT_FOUND", message: "Option not found" });

    if (accountId !== option.accountId)
        throw new GqlError({ code: "UNAUTHORIZED", message: "You are not authorized to modify this option" });

    await store.option.delete({ where: { id } });

    return { message: "Successfully removed a option" };
};

export const removeOptionTypeDefs = gql`
    type Mutation {
        removeOption(id: ID!): Result @auth(requires: [host])
    }
`;

export const removeOptionResolvers = { Mutation: { removeOption } };
