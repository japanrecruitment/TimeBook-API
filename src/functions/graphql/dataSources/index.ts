import { SpaceIndexRecord } from "@utils/algolia";
import AlgoliaDataSource from "./AlgoliaDataSource";
import RedisDataSource from "./RedisDataSource";

export type DataSources = {
    redis: RedisDataSource;
    spaceAlgolia: AlgoliaDataSource<SpaceIndexRecord>;
};

export default (): DataSources => {
    return {
        redis: new RedisDataSource(),
        spaceAlgolia: new AlgoliaDataSource("space"),
    };
};
