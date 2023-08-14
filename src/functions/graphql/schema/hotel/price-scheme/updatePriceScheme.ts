import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { PriceSchemeObject, toPriceSchemeSelect } from "./PriceSchemeObject";
import { mapSelections } from "graphql-map-selections";
import { Log } from "@utils/logger";
import { numToAlphaName } from "@utils/compute";

function validateUpdatePriceSchemeInput(input: UpdatePriceSchemeInput): UpdatePriceSchemeInput {
    let { roomCharge } = input;

    if (roomCharge && roomCharge <= 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "料金を０以下にすることはできません。" });

    return input;
}

type UpdatePriceSchemeInput = {
    id: string;
    roomCharge: number;
    oneAdultCharge: number;
    twoAdultCharge: number;
    threeAdultCharge: number;
    fourAdultCharge: number;
    fiveAdultCharge: number;
    sixAdultCharge: number;
    sevenAdultCharge: number;
    eightAdultCharge: number;
    nineAdultCharge: number;
    tenAdultCharge: number;
    oneChildCharge: number;
    twoChildCharge: number;
    threeChildCharge: number;
    fourChildCharge: number;
    fiveChildCharge: number;
    sixChildCharge: number;
    sevenChildCharge: number;
    eightChildCharge: number;
    nineChildCharge: number;
    tenChildCharge: number;
};

type UpdatePriceSchemeArgs = { input: UpdatePriceSchemeInput };

type UpdatePriceSchemeResult = {
    message: string;
    priceScheme?: PriceSchemeObject;
};

type UpdatePriceScheme = IFieldResolver<any, Context, UpdatePriceSchemeArgs, Promise<UpdatePriceSchemeResult>>;

const updatePriceScheme: UpdatePriceScheme = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const { id, ...data } = validateUpdatePriceSchemeInput(input);

    const priceScheme = await store.priceScheme.findUnique({
        where: { id },
        select: { hotel: { select: { accountId: true } } },
    });
    if (!priceScheme || !priceScheme.hotel)
        throw new GqlError({ code: "NOT_FOUND", message: "料金プランが見つかりません。" });
    if (accountId !== priceScheme.hotel.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const priceSchemeSelect = toPriceSchemeSelect(mapSelections(info)?.priceScheme)?.select;
    const updatedPriceScheme = await store.priceScheme.update({ where: { id }, data, select: priceSchemeSelect });

    Log("updatePriceScheme: ", updatedPriceScheme);

    return {
        message: "料金プランが更新しました。",
        priceScheme: updatedPriceScheme,
    };
};

export const updatePriceSchemeTypeDefs = gql`
    input UpdatePriceSchemeInput {
        id: ID!
        roomCharge: Int
        oneAdultCharge: Int
        twoAdultCharge: Int
        threeAdultCharge: Int
        fourAdultCharge: Int
        fiveAdultCharge: Int
        sixAdultCharge: Int
        sevenAdultCharge: Int
        eightAdultCharge: Int
        nineAdultCharge: Int
        tenAdultCharge: Int
        oneChildCharge: Int
        twoChildCharge: Int
        threeChildCharge: Int
        fourChildCharge: Int
        fiveChildCharge: Int
        sixChildCharge: Int
        sevenChildCharge: Int
        eightChildCharge: Int
        nineChildCharge: Int
        tenChildCharge: Int
    }

    type UpdatePriceSchemeResult {
        message: String!
        priceScheme: PriceSchemeObject
    }

    type Mutation {
        updatePriceScheme(input: UpdatePriceSchemeInput!): UpdatePriceSchemeResult @auth(requires: [host])
    }
`;

export const updatePriceSchemeResolvers = { Mutation: { updatePriceScheme } };
