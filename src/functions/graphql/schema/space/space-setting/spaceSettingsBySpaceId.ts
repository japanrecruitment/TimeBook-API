import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { SpaceSettingFilterOptions } from "./SpaceSettingFilterOptions";
import { SpaceSettingObject, toSpaceSettingSelect } from "./SpaceSettingObject";
import { mapSelections } from "graphql-map-selections";
import { Log } from "@utils/logger";

type SpaceSettingsBySpaceIdArgs = {
    spaceId: string;
};

type SpaceSettingsBySpaceIdResult = Promise<Array<SpaceSettingObject>> | Array<SpaceSettingObject>;

type SpaceSettingsBySpaceId = IFieldResolver<any, Context, SpaceSettingsBySpaceIdArgs, SpaceSettingsBySpaceIdResult>;

const spaceSettingsBySpaceId: SpaceSettingsBySpaceId = async (_, { spaceId }, { store }, info) => {
    const space = await store.space.findFirst({ where: { id: spaceId, isDeleted: false } });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    const select = toSpaceSettingSelect(mapSelections(info));
    const spaceSettings = await store.spaceSetting.findMany({
        where: { spaceId },
        ...select,
    });

    Log(`spaceSettingsBySpaceId:${spaceId}`, spaceSettings);

    return spaceSettings;
};

export const spaceSettingsBySpaceIdTypeDefs = gql`
    type Query {
        spaceSettingsBySpaceId(spaceId: ID!): [SpaceSettingObject]
    }
`;

export const spaceSettingsBySpaceIdResolvers = {
    Query: { spaceSettingsBySpaceId },
};
