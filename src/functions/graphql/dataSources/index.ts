import { SpaceIndexRecord } from "@utils/algolia";
import AlgoliaDataSource from "./AlgoliaDataSource";
import RedisDataSource from "./RedisDS";

export type DataSources = {
    redis: RedisDataSource;
    spaceAlgoliaDS: AlgoliaDataSource<SpaceIndexRecord>;
};

export default (): DataSources => {
    return {
        redis: new RedisDataSource(),
        spaceAlgoliaDS: new AlgoliaDataSource("space"),
    };
};
