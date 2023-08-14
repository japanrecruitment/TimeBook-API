import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { GqlError } from "../../../../error";
import { Context } from "../../../../context";
import { LicenseObject, toLicenseSelect } from "./LicenseObject";

type GetLicensesByAccountIdArgs = { accountId: string };

type GetLicensesByAccountIdResult = Promise<LicenseObject[]>;

type GetLicensesByAccountId = IFieldResolver<any, Context, GetLicensesByAccountIdArgs, GetLicensesByAccountIdResult>;

const getLicensesByAccountId: GetLicensesByAccountId = async (_, { accountId }, { store }, info) => {
    const host = await store.host.findUnique({
        where: { accountId },
        select: { license: { select: toLicenseSelect(mapSelections(info)).select } },
    });

    if (!host) throw new GqlError({ code: "NOT_FOUND", message: "ホストが見つかりませんでした。" });

    Log(host);

    return host.license;
};

export const getLicensesByAccountIdTypeDefs = gql`
    type Query {
        getLicensesByAccountId(accountId: ID!): [LicenseObject]
    }
`;

export const getLicensesByAccountIdResolvers = {
    Query: { getLicensesByAccountId },
};
