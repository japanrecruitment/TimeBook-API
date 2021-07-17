import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { ProfileResult } from "./profile";

type MyProfile = IFieldResolver<any, Context, Record<string, any>, Promise<ProfileResult>>;

const myProfile: MyProfile = async (_, __, { store, authData }) => {
    const { id, registrationNumber } = authData;
    return registrationNumber
        ? await store.company.findUnique({ where: { id } })
        : await store.user.findUnique({ where: { id } });
};

export const myProfileTypeDefs = gql`
    type Query {
        myProfile: ProfileResult @auth(requires: [user, host])
    }
`;

export const myProfileResolvers = {
    Query: { myProfile },
};
