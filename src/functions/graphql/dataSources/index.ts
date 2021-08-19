import { SpaceIndexRecord } from "@utils/algolia";
import CacheDataSource from "./CacheDataSource";
import AlgoliaDataSource from "./AlgoliaDataSource";

export type DataSources = {
    cacheDS: CacheDataSource;
    spaceAlgoliaDS: AlgoliaDataSource<SpaceIndexRecord>;
};

export default (): DataSources => {
    return {
        cacheDS: new CacheDataSource(),
        spaceAlgoliaDS: new AlgoliaDataSource("space"),
    };
};
