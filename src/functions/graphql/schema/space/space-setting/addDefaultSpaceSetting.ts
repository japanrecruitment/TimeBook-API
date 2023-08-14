import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";
import { SpaceSettingObject, toSpaceSettingSelect } from "./SpaceSettingObject";
import { mapSelections } from "graphql-map-selections";

export type AddDefaultSpaceSettingInput = {
    closingHr: number;
    openingHr: number;
    breakFromHr?: number;
    breakToHr?: number;
    businessDays?: Array<number>;
    totalStock?: number;
};

export type AddDefaultSpaceSettingArgs = { spaceId: string; spaceSetting: AddDefaultSpaceSettingInput };

export type AddDefaultSpaceSettingResult = {
    result?: Result;
    setting?: SpaceSettingObject;
};

export type AddDefaultSpaceSetting = IFieldResolver<
    any,
    Context,
    AddDefaultSpaceSettingArgs,
    Promise<AddDefaultSpaceSettingResult>
>;

const addDefaultSpaceSetting: AddDefaultSpaceSetting = async (
    _,
    { spaceSetting, spaceId },
    { authData, store },
    info
) => {
    const { accountId } = authData;

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: {
            accountId: true,
            settings: { where: { isDefault: true }, select: { id: true, isDefault: true } },
        },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "施設が見つかりませんでした。" });

    if (accountId !== space.accountId) throw new GqlError({ code: "FORBIDDEN", message: "この施設は変更できません" });

    if (space.settings.some(({ isDefault }) => isDefault))
        throw new GqlError({ code: "BAD_REQUEST", message: "すでに基本設定が存在されています" });

    let { closingHr, openingHr, breakFromHr, breakToHr, businessDays } = spaceSetting;

    if (closingHr && (closingHr < 0 || closingHr > 24 || (openingHr && closingHr < openingHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "閉店時間が無効です" });

    if (openingHr && (openingHr < 0 || openingHr > 24 || (closingHr && openingHr > closingHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "開始時間が無効です" });

    if (breakFromHr && (breakFromHr > closingHr || breakFromHr < openingHr || (breakToHr && breakFromHr > breakToHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "休憩開始時間が無効です" });

    if (breakToHr && (breakToHr > closingHr || breakToHr < openingHr || (breakFromHr && breakToHr < breakFromHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "休憩終了時間無効です" });

    if (businessDays) {
        businessDays = businessDays.filter((d) => d < 7).sort();
        businessDays = businessDays.filter((c, index) => businessDays.indexOf(c) === index);
    }

    const select = toSpaceSettingSelect(mapSelections(info).setting);
    const setting = await store.spaceSetting.create({
        data: { ...spaceSetting, isDefault: true, space: { connect: { id: spaceId } } },
        ...select,
    });

    return { result: { message: `施設基本設定が保存されました` }, setting };
};

export const addDefaultSpaceSettingTypeDefs = gql`
    type AddDefaultSpaceSettingResult {
        result: Result
        setting: SpaceSettingObject
    }

    input AddDefaultSpaceSettingInput {
        closingHr: Float
        openingHr: Float
        breakFromHr: Float
        breakToHr: Float
        businessDays: [Int]
        totalStock: Int
    }

    type Mutation {
        addDefaultSpaceSetting(spaceId: ID!, spaceSetting: AddDefaultSpaceSettingInput!): AddDefaultSpaceSettingResult!
            @auth(requires: [user, host])
    }
`;

export const addDefaultSpaceSettingResolvers = {
    Mutation: { addDefaultSpaceSetting },
};
