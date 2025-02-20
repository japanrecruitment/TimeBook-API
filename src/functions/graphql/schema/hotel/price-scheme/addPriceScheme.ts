import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { PriceSchemeObject, toPriceSchemeSelect } from "./PriceSchemeObject";
import { mapSelections } from "graphql-map-selections";
import { Log } from "@utils/logger";
import { numToAlphaName } from "@utils/compute";

function validateAddPriceSchemeInput(input: AddPriceSchemeInput): AddPriceSchemeInput {
    let { roomCharge } = input;

    if (roomCharge <= 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "料金を０以下にすることはできません。" });

    return input;
}

type AddPriceSchemeInput = {
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

type AddPriceSchemeArgs = { hotelId: string; input: AddPriceSchemeInput };

type AddPriceSchemeResult = {
    message: string;
    priceScheme?: PriceSchemeObject;
};

type AddPriceScheme = IFieldResolver<any, Context, AddPriceSchemeArgs, Promise<AddPriceSchemeResult>>;

const addPriceScheme: AddPriceScheme = async (_, { hotelId, input }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    const validInput = validateAddPriceSchemeInput(input);

    const hotel = await store.hotel.findFirst({
        where: { id: hotelId, accountId },
        select: { _count: { select: { priceSchemes: true } } },
    });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "宿泊施設が見つかりません。" });

    Log("addPriceScheme: hotel: ", hotel);

    const priceSchemeSelect = toPriceSchemeSelect(mapSelections(info).priceScheme).select;
    const priceScheme = await store.priceScheme.create({
        data: {
            ...validInput,
            name: numToAlphaName(hotel._count.priceSchemes, ""),
            hotel: { connect: { id: hotelId } },
        },
        select: priceSchemeSelect,
    });

    Log("addPriceScheme: ", priceScheme);

    return {
        message: "料金プランが追加しました。",
        priceScheme,
    };
};

export const addPriceSchemeTypeDefs = gql`
    input AddPriceSchemeInput {
        roomCharge: Int!
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

    type AddPriceSchemeResult {
        message: String!
        priceScheme: PriceSchemeObject
    }

    type Mutation {
        addPriceScheme(hotelId: ID!, input: AddPriceSchemeInput!): AddPriceSchemeResult @auth(requires: [host])
    }
`;

export const addPriceSchemeResolvers = { Mutation: { addPriceScheme } };
