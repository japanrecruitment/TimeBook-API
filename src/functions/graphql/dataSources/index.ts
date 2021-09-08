import RedisDataSource from "./RedisDataSource";

export type DataSources = {
    redisDS: RedisDataSource;
};

export default (): DataSources => {
    return {
        redisDS: new RedisDataSource(),
    };
};
