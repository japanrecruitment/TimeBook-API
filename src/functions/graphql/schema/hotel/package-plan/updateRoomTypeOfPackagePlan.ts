import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { compact, differenceWith } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { UpdateBasicPriceSettingInput, validateUpdateBasicPriceSettingInputList } from "../basic-price-setting";
import { PackagePlanRoomTypeObject, toPackagePlanRoomTypeSelect } from "./PackagePlanRoomTypeObject";

function validateUpdateRoomTypeOfPackagePlanInput(
    input: UpdateRoomTypeOfPackagePlanInput
): UpdateRoomTypeOfPackagePlanInput {
    let { id, priceSettings } = input;
    priceSettings = validateUpdateBasicPriceSettingInputList(priceSettings);
    return { id, priceSettings };
}

export type UpdateRoomTypeOfPackagePlanInput = {
    id: string;
    priceSettings: UpdateBasicPriceSettingInput[];
};

type UpdateRoomTypeOfPackagePlanArgs = { input: UpdateRoomTypeOfPackagePlanInput };

type UpdateRoomTypeOfPackagePlanResult = {
    message: string;
    roomType?: PackagePlanRoomTypeObject;
};

type UpdateRoomTypeOfPackagePlan = IFieldResolver<
    any,
    Context,
    UpdateRoomTypeOfPackagePlanArgs,
    Promise<UpdateRoomTypeOfPackagePlanResult>
>;

const updateRoomTypeOfPackagePlan: UpdateRoomTypeOfPackagePlan = async (
    _,
    { input },
    { authData, dataSources, store },
    info
) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const validRoomType = validateUpdateRoomTypeOfPackagePlanInput(input);
    const { id, priceSettings } = validRoomType;

    const roomType = await store.hotelRoom_PackagePlan.findUnique({
        where: { id },
        select: {
            packagePlan: { select: { hotel: { select: { accountId: true, status: true } } } },
            priceSettings: { where: { id: { in: priceSettings.map(({ id }) => id) } }, select: { id: true } },
        },
    });
    if (!roomType || !roomType.packagePlan?.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "プランが見つかりません。" });
    if (accountId !== roomType.packagePlan.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    differenceWith(priceSettings, roomType.priceSettings, (a, b) => a.id === b.id).forEach((id) => {
        throw new GqlError({ code: "NOT_FOUND", message: `基本設定が見つかりません` });
    });

    await Promise.all(
        priceSettings.map(({ id, priceSchemeId }) =>
            store.basicPriceSetting.update({ where: { id }, data: { priceScheme: { connect: { id: priceSchemeId } } } })
        )
    );

    const packagePlanRoomTypeSelect = toPackagePlanRoomTypeSelect(mapSelections(info)?.roomTypes)?.select || {
        id: true,
    };
    const updatedRoomType = await store.hotelRoom_PackagePlan.findUnique({
        where: { id },
        select: {
            ...packagePlanRoomTypeSelect,
            packagePlan:
                roomType.packagePlan.hotel.status === "PUBLISHED"
                    ? {
                          select: {
                              hotel: {
                                  select: {
                                      id: true,
                                      packagePlans: {
                                          select: {
                                              name: true,
                                              paymentTerm: true,
                                              roomTypes: {
                                                  select: { priceSettings: { select: { priceScheme: true } } },
                                              },
                                          },
                                      },
                                      status: true,
                                  },
                              },
                          },
                      }
                    : undefined,
        },
    });

    Log({ updatedRoomType });

    const hotel = updatedRoomType?.packagePlan?.hotel;
    if (hotel && hotel.status === "PUBLISHED") {
        let highestPrice = 0;
        let lowestPrice = 9999999999;
        hotel.packagePlans.forEach(({ paymentTerm, roomTypes }) => {
            const selector = paymentTerm === "PER_PERSON" ? "oneAdultCharge" : "roomCharge";
            roomTypes.forEach(({ priceSettings }) => {
                priceSettings.forEach(({ priceScheme }) => {
                    if (priceScheme[selector] > highestPrice) highestPrice = priceScheme[selector];
                    if (priceScheme[selector] < lowestPrice) lowestPrice = priceScheme[selector];
                });
            });
        });

        await dataSources.hotelAlgolia.partialUpdateObject({
            objectID: hotel.id,
            highestPrice,
            lowestPrice,
        });
    }

    return {
        message: `プランには部屋を追加しました。`,
        roomType: updatedRoomType,
    };
};

export const updateRoomTypeOfPackagePlanTypeDefs = gql`
    input UpdateRoomTypeOfPackagePlanInput {
        id: ID!
        priceSettings: [UpdateBasicPriceSettingInput!]!
    }

    type UpdateRoomTypeOfPackagePlanResult {
        message: String!
        roomType: PackagePlanRoomTypeObject
    }

    type Mutation {
        updateRoomTypeOfPackagePlan(input: UpdateRoomTypeOfPackagePlanInput!): UpdateRoomTypeOfPackagePlanResult
            @auth(requires: [host])
    }
`;

export const updateRoomTypeOfPackagePlanResolvers = { Mutation: { updateRoomTypeOfPackagePlan } };
