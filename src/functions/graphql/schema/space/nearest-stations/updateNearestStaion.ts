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
    exit?: string;
};

type UpdateNearestStationArgs = { input: UpdateNearestStationInput };

type UpdateNearestStationResult = Promise<Result>;

type UpdateNearestStation = IFieldResolver<any, Context, UpdateNearestStationArgs, UpdateNearestStationResult>;

const updateNearestStation: UpdateNearestStation = async (_, { input }, { authData, store }) => {
    const { accountId } = authData;
    const { spaceId, stationId, time, via, exit } = input;

    if (!time && !via) throw new GqlError({ code: "BAD_REQUEST", message: "無効なリクエスト" });

    const nearestStation = await store.nearestStation.findUnique({
        where: { spaceId_stationId: { spaceId, stationId } },
        select: { space: { select: { accountId: true, isDeleted: true } } },
    });

    if (!nearestStation || nearestStation.space.isDeleted)
        throw new GqlError({ code: "NOT_FOUND", message: "最寄りの駅が見つかりません" });

    if (accountId !== nearestStation.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    if (time && time < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な時間です" });

    if (via?.trim() === "") throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な最寄駅からのアクセス" });

    await store.nearestStation.update({
        where: { spaceId_stationId: { spaceId, stationId } },
        data: { time, via: via?.trim(), exit: exit?.trim() },
    });

    return { message: `最寄りの駅を追加しました` };
};

export const updateNearestStationTypeDefs = gql`
    input UpdateNearestStationInput {
        spaceId: ID!
        stationId: IntID!
        via: String
        time: Int
        exit: String
    }

    type Mutation {
        updateNearestStation(input: UpdateNearestStationInput!): Result! @auth(requires: [user, host])
    }
`;

export const updateNearestStationResolvers = {
    Mutation: { updateNearestStation },
};
