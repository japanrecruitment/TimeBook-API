import { IFieldResolver } from "@graphql-tools/utils";
import { omit, pick } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { merge } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Profile } from "./profile";

type MyProfile = IFieldResolver<any, Context, Record<string, any>, Promise<Profile>>;

const myProfile: MyProfile = async (_, __, { store, authData }, info) => {
    const { UserProfile, CompanyProfile } = mapSelections(info);
    const { accountId, profileType } = authData;

    const account = await store.account.findUnique({
        where: { id: accountId },
        select: {
            email: true,
            phoneNumber: true,
            profileType: true,
            userProfile: profileType === "UserProfile" ? { select: omit(UserProfile, "email", "phoneNumber") } : false,
            companyProfile:
                profileType === "CompanyProfile" ? { select: omit(CompanyProfile, "email", "phoneNumber") } : false,
        },
    });
    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "User not found" });

    return merge(pick(account, "email", "phoneNumber", "profileType"), account.userProfile || account.companyProfile);
};

export const myProfileTypeDefs = gql`
    type Query {
        myProfile: Profile @auth(requires: [user, host])
    }
`;

export const myProfileResolvers = {
    Query: { myProfile },
};
