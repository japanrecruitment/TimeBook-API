import { IFieldResolver } from "@graphql-tools/utils";
import { pick } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { merge } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { ProfileResult } from "./profile";

type MyProfile = IFieldResolver<any, Context, Record<string, any>, Promise<ProfileResult>>;

const myProfile: MyProfile = async (_, __, { store, authData }) => {
    const { accountId, profileType } = authData;

    const account = await store.account.findUnique({
        where: { id: accountId },
        select: {
            email: true,
            phoneNumber: true,
            profileType: true,
            userProfile: profileType === "UserProfile",
            companyProfile: profileType === "CompanyProfile",
        },
    });
    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "User not found" });

    return merge(pick(account, "email", "phoneNumber", "profileType"), account.userProfile || account.companyProfile);
};

export const myProfileTypeDefs = gql`
    type Query {
        myProfile: ProfileResult @auth(requires: [user, host])
    }
`;

export const myProfileResolvers = {
    Query: { myProfile },
};
