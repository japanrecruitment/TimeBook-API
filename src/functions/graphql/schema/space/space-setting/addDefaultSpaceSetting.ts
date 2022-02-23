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

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    if (space.settings.some(({ isDefault }) => isDefault))
        throw new GqlError({ code: "BAD_REQUEST", message: "You already have an active default setting" });

    let { closingHr, openingHr, breakFromHr, breakToHr, businessDays } = spaceSetting;

    if (closingHr && (closingHr < 0 || closingHr > 24 || (openingHr && closingHr < openingHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid closing hour" });

    if (openingHr && (openingHr < 0 || openingHr > 24 || (closingHr && openingHr > closingHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid opening hour" });

    if (breakFromHr && (breakFromHr > closingHr || breakFromHr < openingHr || (breakToHr && breakFromHr > breakToHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid break start hour" });

    if (breakToHr && (breakToHr > closingHr || breakToHr < openingHr || (breakFromHr && breakToHr < breakFromHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid break end hour" });

    if (businessDays) {
        businessDays = businessDays.filter((d) => d < 7).sort();
        businessDays = businessDays.filter((c, index) => businessDays.indexOf(c) === index);
    }

    const select = toSpaceSettingSelect(mapSelections(info).setting);
    const setting = await store.spaceSetting.create({
        data: { ...spaceSetting, isDefault: true, space: { connect: { id: spaceId } } },
        ...select,
    });

    return { result: { message: `Successfully added default setting in your space` }, setting };
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
