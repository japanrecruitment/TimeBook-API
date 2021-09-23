import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { omit, pick } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { merge } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { ProfileObject } from "./ProfileObject";
import { toProfileSelect } from ".";

type MyProfile = IFieldResolver<any, Context, Record<string, any>, Promise<ProfileObject>>;

const myProfile: MyProfile = async (_, __, { store, authData }, info) => {
    const { accountId, profileType, roles } = authData;

    const profileSelect = toProfileSelect(mapSelections(info), authData);

    const account = await store.account.findUnique({
        where: { id: accountId },
        ...profileSelect,
    });

    Log(account);

    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "User not found" });

    return merge(omit(account, "userProfile", "companyProfile"), account.userProfile || account.companyProfile);
};

export const myProfileTypeDefs = gql`
    type Query {
        myProfile: Profile @auth(requires: [user, host])
    }
`;

export const myProfileResolvers = {
    Query: { myProfile },
};
