import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { PaginationOption } from "../../core/paginationOption";
import { ProfileType, Role } from "@prisma/client";
import { omit } from "@utils/object-helper";
import { merge } from "lodash";
import { Log } from "@utils/logger";
import { ProfileObject } from "./ProfileObject";
import { toProfileSelect } from ".";

type AccountFilterOptions = {
    approved?: boolean;
    suspended?: boolean;
    profileTypes?: Array<ProfileType>;
    roles?: Array<Role>;
};

type AllAccountsArgs = {
    filters: AccountFilterOptions;
    paginate: PaginationOption;
};

type AllAccounts = IFieldResolver<any, Context, AllAccountsArgs, Promise<Array<Partial<ProfileObject>>>>;

const allAccounts: AllAccounts = async (_, { filters, paginate }, { authData, store }, info) => {
    const { approved, profileTypes, roles, suspended } = filters || {};
    const { take, skip } = paginate || {};

    const profileSelect = toProfileSelect(mapSelections(info), authData);

    const allAccounts = await store.account.findMany({
        where: {
            approved,
            profileType: profileTypes?.length > 0 ? { in: profileTypes } : undefined,
            roles: roles?.length > 0 ? { hasEvery: roles.filter((r) => !r.endsWith("unknown")) } : undefined,
            suspended,
        },
        ...profileSelect,
        take,
        skip,
    });

    Log(`Found ${allAccounts.length} records: `, allAccounts);

    const result = allAccounts.map((account) => {
        return merge(omit(account, "userProfile", "companyProfile"), account.userProfile || account.companyProfile);
    });

    return result;
};

export const allAccountsTypeDefs = gql`
    input AccountFilterOptions {
        approved: Boolean
        suspended: Boolean
        profileTypes: [ProfileType]
        roles: [Role]
    }

    type Query {
        allAccounts(filters: AccountFilterOptions, paginate: PaginationOption): [Profile]! @auth(requires: [host])
    }
`;

export const allAccountsResolvers = {
    Query: { allAccounts },
};
