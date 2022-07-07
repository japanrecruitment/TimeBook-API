import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { PriceSchemeObject, toPriceSchemeSelect } from "./PriceSchemeObject";

type MyPriceSchemesArgs = {
    hotelId: string;
};

type MyPriceSchemesResult = PriceSchemeObject[];

type MyPriceSchemes = IFieldResolver<any, Context, MyPriceSchemesArgs, Promise<MyPriceSchemesResult>>;

const myPriceSchemes: MyPriceSchemes = async (_, { hotelId }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const priceSchemeSelect = toPriceSchemeSelect(mapSelections(info))?.select;

    const myHotels = await store.hotel.findMany({
        where: { id: hotelId || undefined, accountId },
        select: { priceSchemes: { select: priceSchemeSelect } },
    });

    if (hotelId && isEmpty(myHotels)) throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });

    const myPriceSchemes = myHotels.flatMap(({ priceSchemes }) => priceSchemes).filter((priceScheme) => priceScheme);

    Log(`hotelId: `, hotelId, `myPriceSchemes: `, myPriceSchemes);

    return myPriceSchemes;
};

export const myPriceSchemesTypeDefs = gql`
    type Query {
        myPriceSchemes(hotelId: ID): [PriceSchemeObject] @auth(requires: [host])
    }
`;

export const myPriceSchemesResolvers = { Query: { myPriceSchemes } };
