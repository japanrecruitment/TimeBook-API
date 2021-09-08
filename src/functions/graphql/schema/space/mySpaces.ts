import { IFieldResolver } from "@graphql-tools/utils";
import { omit } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";
import { SpaceResult } from "./allSpaces";

type MySpaces = IFieldResolver<any, Context, Record<string, any>, Promise<SpaceResult[]>>;

const mySpaces: MySpaces = async (_, __, { store, authData }, info) => {
    const gqlSelect = mapSelections(info);
    const nearestStationsSelect = toPrismaSelect(gqlSelect.nearestStations);
    const spacePricePlansSelect = toPrismaSelect(gqlSelect.spacePricePlans);
    const spaceTypesSelect = toPrismaSelect(gqlSelect.spaceTypes);
    const addressSelect = toPrismaSelect(gqlSelect.address);
    const spaceSelect = omit(gqlSelect, "nearestStations", "spacePricePlan", "spaceTypes", "address");

    const { accountId } = authData;

    const mySpaces = await store.space.findMany({
        where: { accountId: accountId },
        select: {
            ...spaceSelect,
            nearestStations: nearestStationsSelect,
            spacePricePlans: spacePricePlansSelect,
            spaceTypes: spaceTypesSelect ? { select: { spaceType: spaceTypesSelect } } : undefined,
            address: addressSelect,
        },
    });

    const result = mySpaces.map((space) => {
        const spaceTypes = space.spaceTypes.map((spaceType) => spaceType.spaceType);
        return { ...space, spaceTypes };
    });

    return result || [];
};

export const mySpacesTypeDefs = gql`
    type Query {
        mySpaces: [Space] @auth(requires: [user, host])
    }
`;

export const mySpacesResolvers = {
    Query: { mySpaces },
};
