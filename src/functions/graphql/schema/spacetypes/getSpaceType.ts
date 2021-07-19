import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";
import { IFieldResolver } from "@graphql-tools/utils";

type GetSpaceTypeResult = any;
   
type GetSpaceType = IFieldResolver<any, Context, Record<string,any>, Promise<GetSpaceTypeResult>>;

const getSpaceTypes:GetSpaceType =  async (_, __, { store,dataSources}) => {

  const spaceTypes =   await store.spaceType.findMany({
    orderBy: {title: "asc" },
    take: 20,
    skip: 0,
    });
   
    return spaceTypes || []
}


export const getSpaceTypeDefs = gql`
    type SpaceType {
        id:ID!
        title: String!
        description: String!
    }

    type Query {
        getAllSpaceTypes: SpaceType[] @auth(requires: [admin,user,host])
    }
`;
export const addSpaceTypeResolvers = {
    Query: { getSpaceTypes }
};