import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { omit } from "@utils/object-helper";
import { merge } from "lodash";
import { Log } from "@utils/logger";
import { ProfileObject } from "./ProfileObject";
import { toProfileSelect } from ".";
import { GqlError } from "src/functions/graphql/error";

type AccountByIdArgs = {
    accountId: string;
};

type AccountById = IFieldResolver<any, Context, AccountByIdArgs, Promise<Partial<ProfileObject>>>;

const accountById: AccountById = async (_, { accountId }, { authData, store }, info) => {
    const profileSelect = toProfileSelect(mapSelections(info), authData);

    const account = await store.account.findUnique({
        where: { id: accountId },
        ...profileSelect,
    });

    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "アカウントが見つかりませんでした。" });

    Log(`Found a record: `, account);

    return merge(
        omit(account, "userProfile", "companyProfile"),
        { accountId: account.id },
        account.userProfile || account.companyProfile
    );
};

export const accountByIdTypeDefs = gql`
    type Query {
        accountById(accountId: ID!): Profile! @auth(requires: [user, host])
    }
`;

export const accountByIdResolvers = {
    Query: { accountById },
};
