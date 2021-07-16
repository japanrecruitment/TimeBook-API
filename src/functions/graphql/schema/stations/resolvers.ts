import StationDS from "./StationDS";

export default {
    Query: {
        getStationById: async (_, { stationId }, context, info) => {
            const stationDS: StationDS = context.dataSources.stationDS;
            const result = await stationDS.getStationById(stationId);
            info.cacheControl.setCacheHint({ maxAge: 60, scope: "PUBLIC" });
            return result;
        },

        getAllStations: async (_, {}, context, info) => {
            const stationDS: StationDS = context.dataSources.stationDS;
            const result = await stationDS.getAllStations(20, 0);
            info.cacheControl.setCacheHint({ maxAge: 60, scope: "PUBLIC" });
            return result;
        },

        getLineById: async (_, { lineId }, context, info) => {
            const stationDS: StationDS = context.dataSources.stationDS;
            const result = await stationDS.getLineById(lineId);
            info.cacheControl.setCacheHint({ maxAge: 60, scope: "PUBLIC" });
            return result;
        },

        getAllLines: async (_, {}, context, info) => {
            const stationDS: StationDS = context.dataSources.stationDS;
            const result = await stationDS.getAllLines(20, 0);
            info.cacheControl.setCacheHint({ maxAge: 60, scope: "PUBLIC" });
            return result;
        },
    },
};
