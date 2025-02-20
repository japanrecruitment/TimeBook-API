import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { PricePlanFilterOptions } from "./PricePlanFilterOptions";
import { SpacePricePlanObject, toSpacePricePlanSelect } from "./SpacePricePlanObject";
import { IFieldResolver } from "@graphql-tools/utils";
import { mapSelections } from "graphql-map-selections";
import { Log } from "@utils/logger";

type PricePlanBySpaceIdArgs = {
    spaceId: string;
    filter?: PricePlanFilterOptions;
};

type PricePlanBySpaceIdResult = Promise<Array<SpacePricePlanObject>> | Array<SpacePricePlanObject>;

type PricePlanBySpaceId = IFieldResolver<any, Context, PricePlanBySpaceIdArgs, PricePlanBySpaceIdResult>;

const pricePlanBySpaceId: PricePlanBySpaceId = async (_, { spaceId, filter }, { store }, info) => {
    const space = await store.space.findFirst({ where: { id: spaceId, isDeleted: false } });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "スペースが見つかりません" });

    let { fromDate, toDate, types } = filter;

    types = types && types.length > 0 ? types : ["DAILY", "HOURLY", "MINUTES"];

    const select = toSpacePricePlanSelect(mapSelections(info));
    const pricePlans = await store.spacePricePlan.findMany({
        where: {
            AND: [
                { spaceId, type: { in: types }, isDeleted: false },
                {
                    OR: [
                        { isDefault: true },
                        { AND: [{ fromDate: { lte: fromDate } }, { toDate: { gte: toDate } }] },
                        { AND: [{ fromDate: { gte: fromDate } }, { fromDate: { lte: toDate } }] },
                        { AND: [{ toDate: { gte: fromDate } }, { toDate: { lte: toDate } }] },
                    ],
                },
            ],
        },
        ...select,
    });

    Log(`pricePlanBySpaceId:${spaceId}`, pricePlans);

    return pricePlans;
};

export const pricePlanBySpaceIdTypeDefs = gql`
    type Query {
        pricePlanBySpaceId(spaceId: ID!, filter: PricePlanFilterOptions!): [SpacePricePlanObject]
    }
`;

export const pricePlanBySpaceIdResolvers = {
    Query: { pricePlanBySpaceId },
};
