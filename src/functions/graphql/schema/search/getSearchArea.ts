import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type GetSearchAreaArgs = { type: "hotel" | "space" };
type SearchResultItem = { prefecture: string; area: [string] };

type GetSearchAreaResult = Promise<SearchResultItem | null>;

type GetSearchArea = IFieldResolver<any, Context, GetSearchAreaArgs, GetSearchAreaResult>;

const getSearchArea: GetSearchArea = async (_, { type }, { dataSources }) => {
    const cacheKey = `search-area:${type}`;
    const data = await dataSources.redis.fetch(cacheKey);
    if (!data || data.length === 0) {
        // no data
        Log("[SEARCH AREA]: No data in cache so querying algolia for facet");
        const algoliaClient = type === "space" ? dataSources.spaceAlgolia : dataSources.hotelAlgolia;
        const prefectures = await algoliaClient.getPrefectures();

        const result = await Promise.all(
            prefectures.map(async (prefecture) => {
                const city = await algoliaClient.getCities(`prefecture:${prefecture}`);
                return { prefecture, city };
            })
        );
        Log("[UPDATING CACHE]");
        if (result.length) {
            await dataSources.redis.store(cacheKey, result, 3600);
            return result;
        } else {
            return null;
        }
    }
    return data;
};

export const getSearchAreaTypeDefs = gql`
    enum SearchAreaType {
        hotel
        space
    }
    type SearchResult {
        prefecture: String
        city: [String]
    }
    type Query {
        getSearchArea(type: SearchAreaType!): [SearchResult]
    }
`;

export const getSearchAreaResolvers = {
    Query: { getSearchArea: getSearchArea },
};
