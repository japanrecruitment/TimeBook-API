import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { PriceOverrideObject, toPriceOverrideSelect } from "./PriceOverrideObject";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Log } from "@utils/logger";

type PriceOverridesByRoomPlanIdArgs = { roomPlanId: string };

type PriceOverridesByRoomPlanIdResult = PriceOverrideObject[];

type PriceOverridesByRoomPlanId = IFieldResolver<
    any,
    Context,
    PriceOverridesByRoomPlanIdArgs,
    Promise<PriceOverridesByRoomPlanIdResult>
>;

const priceOverridesByRoomPlanId: PriceOverridesByRoomPlanId = async (_, { roomPlanId }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const priceOverrideSelect = toPriceOverrideSelect(mapSelections(info));
    const roomPlan = await store.hotelRoom_PackagePlan.findUnique({
        where: { id: roomPlanId },
        select: { priceOverrides: priceOverrideSelect },
    });
    if (!roomPlan) throw new GqlError({ code: "NOT_FOUND", message: "Room plan not found" });

    let priceOverrides = roomPlan.priceOverrides;
    if (isEmpty(roomPlan.priceOverrides)) priceOverrides = [];

    Log(priceOverrides);

    return priceOverrides;
};

export const priceOverridesByRoomPlanIdTypeDefs = gql`
    type Query {
        priceOverridesByRoomPlanId(roomPlanId: ID!): [PriceOverrideObject] @auth(requires: [host])
    }
`;

export const priceOverridesByRoomPlanIdResolvers = { Query: { priceOverridesByRoomPlanId } };
