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
    const packagePlanSelect = toPackagePlanSelect(mapSelections(info))?.select;

    const packagePlan = await store.packagePlan.findUnique({
        where: { id },
        select: packagePlanSelect,
    });

    Log(`id: `, id, `packagePlanById: `, packagePlan);

    if (!packagePlan) throw new GqlError({ code: "NOT_FOUND", message: "プランが見つかりません" });

    return packagePlan;
};

export const packagePlanByIdTypeDefs = gql`
    type Query {
        packagePlanById(id: ID!): PackagePlanObject
    }
`;

export const packagePlanByIdResolvers = { Query: { packagePlanById } };
