import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "@libs/graphql-map-selections";
import { Context } from "../../context";
import { Profile } from "./profile";
import { PaginationOption } from "../core/paginationOption";
import { ProfileType, Role } from ".prisma/client";
import { omit, pick } from "@utils/object-helper";
import { mapPhotoSelection } from "../media";
import { merge } from "lodash";
import { Log } from "@utils/logger";

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

type AllAccounts = IFieldResolver<any, Context, AllAccountsArgs, Promise<Array<Partial<Profile>>>>;

const allAccounts: AllAccounts = async (_, { filters, paginate }, { store }, info) => {
    const { UserProfile, CompanyProfile } = mapSelections(info);

    const userProfileSelect = toPrismaSelect(
        omit(
            merge(UserProfile, { profilePhoto: mapPhotoSelection(UserProfile.profilePhoto) }),
            "email",
            "phoneNumber",
            "roles"
        )
    );
    const companyProfileSelect = toPrismaSelect(
        omit(
            merge(CompanyProfile, { profilePhoto: mapPhotoSelection(CompanyProfile.profilePhoto) }),
            "email",
            "phoneNumber",
            "roles"
        )
    );

    const { approved, profileTypes, roles, suspended } = filters || {};
    const { take, skip } = paginate || {};

    const allAccounts = await store.account.findMany({
        where: {
            approved,
            profileType: profileTypes?.length > 0 ? { in: profileTypes } : undefined,
            roles: roles?.length > 0 ? { hasEvery: roles.filter((r) => !r.endsWith("unknown")) } : undefined,
            suspended,
        },
        select: {
            email: true,
            phoneNumber: true,
            profileType: true,
            roles: true,
            userProfile: userProfileSelect,
            companyProfile: companyProfileSelect,
        },
        take,
        skip,
    });

    Log(`Found ${allAccounts.length} records: `, allAccounts);

    const result = allAccounts.map((account) => {
        return merge(
            pick(account, "email", "phoneNumber", "profileType", "roles"),
            account.userProfile || account.companyProfile
        );
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
        allAccounts(filters: AccountFilterOptions, paginate: PaginationOption): [Profile]! @auth(requires: [admin])
    }
`;

export const allAccountsResolvers = {
    Query: { allAccounts },
};
