import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "src/functions/graphql/context";
import { AddBasicPriceSettingInput, validateAddBasicPriceSettingInputList } from "../basic-price-setting";
import { PackagePlanRoomTypeObject } from "./PackagePlanRoomTypeObject";

function validateAddRoomTypesInPackagePlanInput(input: AddRoomTypesInPackagePlanInput): AddRoomTypesInPackagePlanInput {
    let { hotelRoomId, priceSettings } = input;
    hotelRoomId = input.hotelRoomId;
    priceSettings = validateAddBasicPriceSettingInputList(priceSettings);
    return { hotelRoomId, priceSettings };
}

export function validateAddRoomTypesInPackagePlanInputList(
    input: AddRoomTypesInPackagePlanInput[]
): AddRoomTypesInPackagePlanInput[] {
    return input.map(validateAddRoomTypesInPackagePlanInput);
}

export type AddRoomTypesInPackagePlanInput = {
    hotelRoomId: string;
    priceSettings: AddBasicPriceSettingInput[];
};

type AddRoomTypesInPackagePlanArgs = {
    packagePlanId: string;
    roomTypes: AddRoomTypesInPackagePlanInput[];
};

type AddRoomTypesInPackagePlanResult = {
    message: string;
    roomTypes?: PackagePlanRoomTypeObject[];
};

type AddRoomTypesInPackagePlan = IFieldResolver<
    any,
    Context,
    AddRoomTypesInPackagePlanArgs,
    Promise<AddRoomTypesInPackagePlanResult>
>;

const addRoomTypesInPackagePlan: AddRoomTypesInPackagePlan = async () => {
    return {
        message: `Successfully added room type is package plan`,
    };
};

export const addRoomTypesInPackagePlanTypeDefs = gql`
    input AddRoomTypesInPackagePlanInput {
        hotelRoomId: ID!
        priceSettings: [AddBasicPriceSettingInput]!
    }

    type AddRoomTypesInPackagePlanResult {
        message: String!
        roomTypes: [PackagePlanRoomTypeObject]
    }

    type Mutation {
        addRoomTypesInPackagePlan(
            packagePlanId: ID!
            roomTypes: [AddRoomTypesInPackagePlanInput]!
        ): AddRoomTypesInPackagePlanResult @auth(requires: [host])
    }
`;

export const addRoomTypesInPackagePlanResolvers = { Mutation: { addRoomTypesInPackagePlan } };
