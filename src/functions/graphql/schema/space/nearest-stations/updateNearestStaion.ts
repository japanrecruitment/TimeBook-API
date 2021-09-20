import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type UpdateNearestStationInput = {
    spaceId: string;
    stationId: number;
    via?: string;
    time?: number;
};

type UpdateNearestStationArgs = { input: UpdateNearestStationInput };

type UpdateNearestStationResult = Promise<Result>;

type UpdateNearestStation = IFieldResolver<any, Context, UpdateNearestStationArgs, UpdateNearestStationResult>;

const updateNearestStation: UpdateNearestStation = async (_, { input }, { authData, store }) => {
    const { accountId } = authData;
    const { spaceId, stationId, time, via } = input;

    if (!time && !via)
        throw new GqlError({ code: "BAD_REQUEST", message: "All fields in submited nearest station are empty" });

    const nearestStation = await store.nearestStation.findUnique({
        where: { spaceId_stationId: { spaceId, stationId } },
        select: { space: { select: { accountId: true } } },
    });

    if (!nearestStation) throw new GqlError({ code: "NOT_FOUND", message: "Nearest station not found" });

    if (accountId !== nearestStation.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    if (time && time < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid time" });

    if (via?.trim() === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid via" });

    await store.nearestStation.update({
        where: { spaceId_stationId: { spaceId, stationId } },
        data: { time, via: via?.trim() },
    });

    return { message: `Successfully updated nearest station` };
};

export const updateNearestStationTypeDefs = gql`
    input UpdateNearestStationInput {
        spaceId: ID!
        stationId: IntID!
        via: String
        time: Int
    }

    type Mutation {
        updateNearestStation(input: UpdateNearestStationInput!): Result! @auth(requires: [user, host])
    }
`;

export const updateNearestStationResolvers = {
    Mutation: { updateNearestStation },
};
