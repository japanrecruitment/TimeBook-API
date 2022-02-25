import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Result } from "../../core/result";
import { SpaceSettingObject, toSpaceSettingSelect } from "./SpaceSettingObject";
import { mapSelections } from "graphql-map-selections";
import { omit } from "@utils/object-helper";
import { merge } from "lodash";

export type UpdateSpaceSettingInput = {
    id: string;
    closingHr?: number;
    openingHr?: number;
    breakFromHr?: number;
    breakToHr?: number;
    businessDays?: Array<number>;
    totalStock?: number;
    closed?: boolean;
    fromDate?: Date;
    toDate?: Date;
};

export type UpdateSpaceSettingArgs = { input: UpdateSpaceSettingInput };

export type UpdateSpaceSettingResult = {
    result?: Result;
    setting?: SpaceSettingObject;
};

export type UpdateSpaceSetting = IFieldResolver<
    any,
    Context,
    UpdateSpaceSettingArgs,
    Promise<UpdateSpaceSettingResult>
>;

const updateSpaceSetting: UpdateSpaceSetting = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData;
    const { id, ...inputData } = input;

    const setting = await store.spaceSetting.findFirst({
        where: { id },
        include: { space: { select: { accountId: true } } },
    });

    if (!setting) throw new GqlError({ code: "NOT_FOUND", message: "Space setting not found" });

    if (accountId !== setting.space.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this space setting" });

    const prevSetting = omit(setting, "createdAt", "space", "spaceId", "updatedAt");
    const mergedInput = merge(prevSetting, inputData);
    let { closingHr, openingHr, breakFromHr, breakToHr, businessDays, fromDate, toDate } = mergedInput;

    if (fromDate && (fromDate.getTime() < Date.now() || (toDate && fromDate.getTime() >= toDate.getTime())))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid start date" });

    if (toDate && (toDate.getTime() < Date.now() || (fromDate && toDate.getTime() <= fromDate.getTime())))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid end date" });

    if (closingHr && (closingHr < 0 || closingHr > 24 || (openingHr && closingHr < openingHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid closing hour" });

    if (openingHr && (openingHr < 0 || openingHr > 24 || (closingHr && openingHr > closingHr)))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid opening hour" });

    if ((breakFromHr && (breakFromHr > closingHr || breakFromHr < openingHr)) || (breakToHr && breakFromHr > breakToHr))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid break start hour" });

    if ((breakToHr && (breakToHr > closingHr || breakToHr < openingHr)) || (breakFromHr && breakToHr < breakFromHr))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid break end hour" });

    if (businessDays) {
        businessDays = businessDays.filter((d) => d < 7).sort();
        businessDays = businessDays.filter((c, index) => businessDays.indexOf(c) === index);
    }

    const select = toSpaceSettingSelect(mapSelections(info).setting);
    const updatedSetting = await store.spaceSetting.update({
        where: { id },
        data: mergedInput,
        ...select,
    });

    return { result: { message: `Successfully updated a setting in your space` }, setting: updatedSetting };
};

export const updateSpaceSettingTypeDefs = gql`
    type UpdateSpaceSettingResult {
        result: Result
        setting: SpaceSettingObject
    }

    input UpdateSpaceSettingInput {
        id: ID!
        closingHr: Int
        openingHr: Int
        breakFromHr: Int
        breakToHr: Int
        businessDays: [Int]
        totalStock: Int
        closed: Boolean
        fromDate: Date
        toDate: Date
    }

    type Mutation {
        updateSpaceSetting(input: UpdateSpaceSettingInput): UpdateSpaceSettingResult! @auth(requires: [user, host])
    }
`;

export const updateSpaceSettingResolvers = {
    Mutation: { updateSpaceSetting },
};
