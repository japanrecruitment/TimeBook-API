import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { PriceSchemeObject } from "./PriceSchemeObject";

function validateAddPriceSchemeInput(input: AddPriceSchemeInput): AddPriceSchemeInput {
    return input;
}

type AddPriceSchemeInput = {
    name: string;
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

const addPriceScheme: AddPriceScheme = async () => {
    return {
        message: "Successfully added a Price Scheme!!",
    };
};

export const addPriceSchemeTypeDefs = gql`
    input AddPriceSchemeInput {
        name: String!
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
