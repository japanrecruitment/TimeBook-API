import CacheDataSource from "./CacheDataSource";

export type DataSources = {
    cacheDS: CacheDataSource;
};

export default (): DataSources => {
    return {
        cacheDS: new CacheDataSource(),
    };
};
