import { HotelIndexRecord, SpaceIndexRecord } from "@utils/algolia";
import AlgoliaDataSource from "./AlgoliaDataSource";
import { GoogleMapDataSource } from "./GoogleMapDataSource";
import RedisDataSource from "./RedisDataSource";

export type DataSources = {
    redis: RedisDataSource;
    spaceAlgolia: AlgoliaDataSource<SpaceIndexRecord>;
    hotelAlgolia: AlgoliaDataSource<HotelIndexRecord>;
    googleMap: GoogleMapDataSource;
};

export default (): DataSources => {
    return {
        redis: new RedisDataSource(),
        spaceAlgolia: new AlgoliaDataSource("space"),
        hotelAlgolia: new AlgoliaDataSource("hotel"),
        googleMap: new GoogleMapDataSource(),
    };
};
