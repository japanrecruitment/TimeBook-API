import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { GqlError } from "../../../../error";
import { Context } from "../../../../context";
import { LicenseObject, toLicenseSelect } from "./LicenseObject";

type GetMyLicensesResult = Promise<LicenseObject[]>;

type GetMyLicenses = IFieldResolver<any, Context, any, GetMyLicensesResult>;

const getMyLicenses: GetMyLicenses = async (_, __, { authData, store }, info) => {
    const { accountId } = authData;

    const host = await store.host.findUnique({
        where: { accountId },
        select: { license: { select: toLicenseSelect(mapSelections(info)).select } },
    });

    if (!host) throw new GqlError({ code: "NOT_FOUND", message: "Host doesn't exist" });

    Log(host);

    return host.license;
};

export const getMyLicensesTypeDefs = gql`
    type Query {
        getMyLicenses: [LicenseObject] @auth(requires: [host])
    }
`;

export const getMyLicensesResolvers = {
    Query: { getMyLicenses },
};
