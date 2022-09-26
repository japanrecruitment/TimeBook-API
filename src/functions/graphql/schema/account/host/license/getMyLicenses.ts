import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { GqlError } from "../../../../error";
import { Context } from "../../../../context";
import { LicenseObject, toLicenseSelect } from "./LicenseObject";
import {
    createPaginationResult,
    createPaginationResultType,
    PaginationOption,
    PaginationResult,
} from "../../../core/pagination";

type GetMyLicensesArgs = {
    paginate: PaginationOption;
};

type GetMyLicensesResult = Promise<PaginationResult<LicenseObject>>;

type GetMyLicenses = IFieldResolver<any, Context, GetMyLicensesArgs, GetMyLicensesResult>;

const getMyLicenses: GetMyLicenses = async (_, { paginate }, { authData, store }, info) => {
    const { accountId } = authData;

    const { skip, take } = paginate || {};

    const host = await store.host.findUnique({
        where: { accountId },
        select: { license: { select: toLicenseSelect(mapSelections(info)).select, take: take && take + 1, skip } },
    });

    if (!host) throw new GqlError({ code: "NOT_FOUND", message: "Host doesn't exist" });

    Log(host);

    return createPaginationResult(host.license, take, skip);
};

export const getMyLicensesTypeDefs = gql`
    ${createPaginationResultType("GetMyLincensesResult", "LicenseObject")}

    type Query {
        getMyLicenses(paginate: PaginationOption): GetMyLincensesResult @auth(requires: [host])
    }
`;

export const getMyLicensesResolvers = {
    Query: { getMyLicenses },
};
