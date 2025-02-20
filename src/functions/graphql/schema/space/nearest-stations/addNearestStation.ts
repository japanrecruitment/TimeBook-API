import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { merge } from "lodash";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";
import { NearestStationObject, toNearestStationSelect } from "./NearestStationObject";

type AddNearestStationInput = {
    stationId: number;
    via: string;
    time: number;
    exit: string;
};

type AddNearestStationsArgs = { spaceId: string; stations: AddNearestStationInput[] };

type AddNearestStationsResult = {
    result: Result;
    nearestStations: NearestStationObject[];
};

type AddNearestStations = IFieldResolver<any, Context, AddNearestStationsArgs, Promise<AddNearestStationsResult>>;

const addNearestStations: AddNearestStations = async (
    _,
    { spaceId, stations },
    { authData, dataSources, store },
    info
) => {
    const { accountId } = authData;

    if (!stations || stations.length <= 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "追加するステーションをいくつか選択してください" });

    stations.forEach((station, index) => {
        const hasDuplicateStation = stations.slice(index + 1).some((s) => s.stationId === station.stationId);
        if (hasDuplicateStation)
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: "選択範囲内に同じ ID を持つ複数のステーションが見つかりました",
            });
    });

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: { accountId: true, nearestStations: { select: { stationId: true } } },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "スペースが見つかりません" });

    if (accountId !== space.accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const nearestStationsIds = space?.nearestStations?.map(({ stationId }) => stationId);
    const nearestStationToAdd = stations
        .filter(({ stationId }) => !nearestStationsIds.includes(stationId))
        .map(({ stationId, time, via, exit }) => ({ stationId, time, via: via?.trim(), exit: exit?.trim() }));

    if (nearestStationToAdd.length <= 0)
        throw new GqlError({
            message: `送信されたステーション リストに追加する新しいステーションが見つかりませんでした`,
        });

    const updatedSpace = await store.space.update({
        where: { id: spaceId },
        data: { nearestStations: { createMany: { data: nearestStationToAdd } } },
        select: {
            id: true,
            published: true,
            nearestStations: merge(toNearestStationSelect(mapSelections(info).nearestStations), {
                select: { stationId: true },
            }),
        },
    });

    if (updatedSpace.published) {
        await dataSources.spaceAlgolia.partialUpdateObject({
            objectID: updatedSpace.id,
            nearestStations: updatedSpace.nearestStations.map(({ stationId }) => stationId),
        });
    }

    return {
        nearestStations: updatedSpace.nearestStations,
        result: { message: `新しい駅が追加されました` },
    };
};

export const addNearestStationsTypeDefs = gql`
    input AddNearestStationInput {
        stationId: IntID!
        via: String!
        time: Int!
        exit: String
    }

    type AddNearestStationsResult {
        result: Result
        nearestStations: [NearestStationObject]
    }

    type Mutation {
        addNearestStations(spaceId: ID!, stations: [AddNearestStationInput]!): AddNearestStationsResult!
            @auth(requires: [user, host])
    }
`;

export const addNearestStationsResolvers = {
    Mutation: { addNearestStations },
};
