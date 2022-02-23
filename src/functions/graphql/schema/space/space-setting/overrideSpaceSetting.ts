import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";
import { SpaceSettingObject, toSpaceSettingSelect } from "./SpaceSettingObject";
import { mapSelections } from "graphql-map-selections";
import { omit } from "@utils/object-helper";

export type OverrideSpaceSettingInput = {
    fromDate: Date;
    toDate: Date;
    closingHr?: number;
    openingHr?: number;
    breakFromHr?: number;
    breakToHr?: number;
    closed?: boolean;
    totalStock?: number;
};

export type OverrideSpaceSettingArgs = { spaceId: string; spaceSetting: OverrideSpaceSettingInput };

export type OverrideSpaceSettingResult = {
    result?: Result;
    setting?: SpaceSettingObject;
};

export type OverrideSpaceSetting = IFieldResolver<
    any,
    Context,
    OverrideSpaceSettingArgs,
    Promise<OverrideSpaceSettingResult>
>;

const overrideSpaceSetting: OverrideSpaceSetting = async (_, { spaceSetting, spaceId }, { authData, store }, info) => {
    const { accountId } = authData;

    const space = await store.space.findFirst({
        where: { id: spaceId, isDeleted: false },
        select: { accountId: true, settings: { where: { isDefault: true } } },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (accountId !== space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space" });

    if (space.settings.length <= 0)
        throw new GqlError({ code: "FORBIDDEN", message: "Please add default setting before overriding" });

    let { closingHr, openingHr, breakFromHr, breakToHr, fromDate, toDate } = spaceSetting;

    if (fromDate.getTime() < Date.now() || fromDate.getTime() >= toDate.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid start date" });

    if (toDate.getTime() < Date.now() || toDate.getTime() <= fromDate.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid end date" });

    if (closingHr && (closingHr < 0 || closingHr > 24 || (openingHr && closingHr < openingHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid closing hour" });

    if (openingHr && (openingHr < 0 || openingHr > 24 || (closingHr && openingHr > closingHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid opening hour" });

    if (breakFromHr && (breakFromHr > closingHr || breakFromHr < openingHr || (breakToHr && breakFromHr > breakToHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid break start hour" });

    if (breakToHr && (breakToHr > closingHr || breakToHr < openingHr || (breakFromHr && breakToHr < breakFromHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid break end hour" });

    const defaultSetting = omit(space.settings[space.settings.length - 1], "createdAt", "id", "spaceId", "updatedAt");

    const select = toSpaceSettingSelect(mapSelections(info).setting);
    const setting = await store.spaceSetting.create({
        data: { ...defaultSetting, ...spaceSetting, isDefault: false, space: { connect: { id: spaceId } } },
        ...select,
    });

    return { result: { message: `Successfully added default setting in your space` }, setting };
};

export const overrideSpaceSettingTypeDefs = gql`
    type OverrideSpaceSettingResult {
        result: Result
        setting: SpaceSettingObject
    }

    input OverrideSpaceSettingInput {
        fromDate: Date!
        toDate: Date!
        closingHr: Float
        openingHr: Float
        breakFromHr: Float
        breakToHr: Float
        closed: Boolean
        totalStock: Int
    }

    type Mutation {
        overrideSpaceSetting(spaceId: ID!, spaceSetting: OverrideSpaceSettingInput!): OverrideSpaceSettingResult!
            @auth(requires: [user, host])
    }
`;

export const overrideSpaceSettingResolvers = {
    Mutation: { overrideSpaceSetting },
};
