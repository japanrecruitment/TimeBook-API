import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type PublishHotelArgs = { id: string };

type PublishHotelResult = Result;

type PublishHotel = IFieldResolver<any, Context, PublishHotelArgs, Promise<PublishHotelResult>>;

const publishHotel: PublishHotel = async (_, { id }, { authData, store }) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const hotel = await store.hotel.findFirst({ where: { id, accountId } });
    if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "Hotel not found" });

    const updatedHotel = await store.hotel.update({ where: { id }, data: { status: "PUBLISHED" } });

    Log(updatedHotel);

    return { message: `Successfully published hotel` };
};

export const publishHotelTypeDefs = gql`
    type Mutation {
        publishHotel(id: ID!): Result @auth(requires: [host])
    }
`;

export const publishHotelResolvers = { Mutation: { publishHotel } };
