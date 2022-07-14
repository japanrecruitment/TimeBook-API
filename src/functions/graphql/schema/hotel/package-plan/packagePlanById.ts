import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { PackagePlanObject, toPackagePlanSelect } from "./PackagePlanObject";

type PackagePlanByIdArgs = {
    id: string;
};

type PackagePlanByIdResult = PackagePlanObject;

type PackagePlanById = IFieldResolver<any, Context, PackagePlanByIdArgs, Promise<PackagePlanByIdResult>>;

const packagePlanById: PackagePlanById = async (_, { id }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const packagePlanSelect = toPackagePlanSelect(mapSelections(info))?.select;

    const packagePlan = await store.packagePlan.findUnique({
        where: { id },
        select: packagePlanSelect,
    });

    Log(`id: `, id, `packagePlanById: `, packagePlan);

    if (!packagePlan) throw new GqlError({ code: "NOT_FOUND", message: "Package plan not found" });

    return packagePlan;
};

export const packagePlanByIdTypeDefs = gql`
    type Query {
        packagePlanById(id: ID!): PackagePlanObject @auth(requires: [host])
    }
`;

export const packagePlanByIdResolvers = { Query: { packagePlanById } };
