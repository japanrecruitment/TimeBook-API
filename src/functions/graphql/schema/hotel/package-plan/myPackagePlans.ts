import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty, take } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import {
    createPaginationResult,
    createPaginationResultType,
    PaginationOption,
    PaginationResult,
} from "../../core/pagination";
import { PackagePlanObject, toPackagePlanSelect } from "./PackagePlanObject";

type MyPackagePlansArgs = {
    hotelId: string;
    paginate: PaginationOption;
};

type MyPackagePlansResult = PaginationResult<PackagePlanObject>;

type MyPackagePlans = IFieldResolver<any, Context, MyPackagePlansArgs, Promise<MyPackagePlansResult>>;

const myPackagePlans: MyPackagePlans = async (_, { hotelId, paginate }, { authData, store }, info) => {
    const { accountId } = authData || { accountId: null };
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const { take, skip } = paginate || {};

    const packagePlanSelect = toPackagePlanSelect(mapSelections(info)?.data)?.select;

    const myHotels = await store.hotel.findMany({
        where: { id: hotelId || undefined, accountId },
        select: {
            packagePlans: { select: packagePlanSelect, orderBy: { createdAt: "desc" }, take: take && take + 1, skip },
        },
    });

    if (hotelId && isEmpty(myHotels)) throw new GqlError({ code: "NOT_FOUND", message: "プランが見つかりません。" });

    const myPackagePlans = myHotels.flatMap(({ packagePlans }) => packagePlans).filter((packagePlans) => packagePlans);

    Log(`hotelId: `, hotelId, `myPackagePlans: `, myPackagePlans);

    return createPaginationResult(myPackagePlans, take, skip);
};

export const myPackagePlansTypeDefs = gql`
    ${createPaginationResultType("MyPackagePlansResult", "PackagePlanObject")}

    type Query {
        myPackagePlans(hotelId: ID, paginate: PaginationOption): MyPackagePlansResult @auth(requires: [host])
    }
`;

export const myPackagePlansResolvers = { Query: { myPackagePlans } };
