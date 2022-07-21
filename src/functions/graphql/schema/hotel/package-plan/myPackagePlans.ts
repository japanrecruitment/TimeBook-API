import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { PackagePlanObject, toPackagePlanSelect } from "./PackagePlanObject";

type MyPackagePlansArgs = {
    hotelId: string;
};

type MyPackagePlansResult = PackagePlanObject[];

type MyPackagePlans = IFieldResolver<any, Context, MyPackagePlansArgs, Promise<MyPackagePlansResult>>;

const myPackagePlans: MyPackagePlans = async (_, { hotelId }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const packagePlanSelect = toPackagePlanSelect(mapSelections(info))?.select;

    const myHotels = await store.hotel.findMany({
        where: { id: hotelId || undefined, accountId },
        select: { packagePlans: { select: packagePlanSelect, orderBy: { createdAt: "desc" } } },
    });

    if (hotelId && isEmpty(myHotels)) throw new GqlError({ code: "NOT_FOUND", message: "Package plans not found" });

    const myPackagePlans = myHotels.flatMap(({ packagePlans }) => packagePlans).filter((packagePlans) => packagePlans);

    Log(`hotelId: `, hotelId, `myPackagePlans: `, myPackagePlans);

    return myPackagePlans;
};

export const myPackagePlansTypeDefs = gql`
    type Query {
        myPackagePlans(hotelId: ID): [PackagePlanObject] @auth(requires: [host])
    }
`;

export const myPackagePlansResolvers = { Query: { myPackagePlans } };
