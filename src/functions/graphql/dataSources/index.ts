import { SpaceIndexRecord } from "@utils/algolia";
import AlgoliaDataSource from "./AlgoliaDataSource";
import RedisDataSource from "./RedisDataSource";

export type DataSources = {
    redisDS: RedisDataSource;
    spaceAlgoliaDS: AlgoliaDataSource<SpaceIndexRecord>;
};

export default (): DataSources => {
    return {
        redisDS: new RedisDataSource(),
        spaceAlgoliaDS: new AlgoliaDataSource("space"),
    };
};
