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

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    let { fromDate, toDate } = filter || {};

    fromDate = fromDate || new Date();

    const select = toSpacePricePlanSelect(mapSelections(info));
    const pricePlans = await store.spacePricePlan.findMany({
        where: {
            AND: [
                { spaceId, isDeleted: false },
                {
                    OR: [
                        { isDefault: true },
                        { fromDate: { gte: fromDate }, toDate: toDate ? { lte: toDate } : undefined },
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
    type Ouery {
        pricePlanBySpaceId(spaceId: ID!, filter: PricePlanFilterOptions): [SpacePricePlanObject]
    }
`;

export const pricePlanBySpaceIdResolvers = {
    Query: { pricePlanBySpaceId },
};
