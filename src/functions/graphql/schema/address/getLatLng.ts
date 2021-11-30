import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type GetLatLngArgs = { prefecture: string; city: string; addressLine: string };

type GetLatLngResult = { lat: number; lng: number };

type GetLatLng = IFieldResolver<any, Context, GetLatLngArgs, Promise<GetLatLngResult>>;

const _getLatLng: GetLatLng = async (_, { addressLine, city, prefecture }, { dataSources }) => {
    return await dataSources.googleMap.getLatLng(prefecture, city, addressLine);
};

export const getLatLngTypeDefs = gql`
    type LatLng {
        lat: Float
        lng: Float
    }

    type Query {
        _getLatLng(prefecture: String!, city: String!, addressLine: String!): LatLng
    }
`;

export const getLatLngResolvers = {
    Query: { _getLatLng },
};
