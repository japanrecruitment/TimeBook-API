import { ApolloError } from "apollo-server-lambda";
import { Log } from "@utils/index";
import PrismaDataSource from "@libs/PrismaDataSource";
import { KnownTypeNamesRule } from "graphql";

class StationDS extends PrismaDataSource {
    getAllStations = async (limit: number, after: number) => {
        const stations = await this.store.station.findMany({
            where: {
                prefecture: {
                    available: true,
                },
            },
            orderBy: { order: "asc" },
            take: limit,
            skip: after,
        });
        Log("getAllStations: ", stations);
        return stations || [];
    };

    getStationById = async (stationId: string) => {
        if (!stationId) return null;
        const cacheDoc = await this.fetchFromCache(stationId);
        if (cacheDoc) return cacheDoc;
        const station = await this.store.station.findUnique({
            where: { id: parseInt(stationId, 10) },
        });
        if (!station) throw new ApolloError("No such station exists");
        // this.storeInCache(station.id, station, 100);
        Log("getStationById: ", station);
        return station;
    };

    getManyStationsByIds = async (stationIds: string[]) => {
        if (!stationIds || stationIds.length === 0) return [];
        const stations = await this.store.station.findMany({
            where: { id: { in: stationIds.map((stationId) => parseInt(stationId, 10)) } },
        });
        Log("getManyStationsByIds: ", stations);
        return stations;
    };

    getAllLines = async (limit: number, after: number) => {
        const lines = await this.store.trainLine.findMany({
            where: {
                status: 0,
                stations: {},
            },
            include: {
                stations: true,
            },
            orderBy: { order: "asc" },
            take: limit,
            skip: after,
        });
        Log("getAllLines: ", lines);
        return lines || [];
    };

    getLineById = async (lineId: string) => {
        if (!lineId) return null;
        const cacheDoc = await this.fetchFromCache(lineId);
        if (cacheDoc) return cacheDoc;
        const line = await this.store.trainLine.findUnique({
            where: { id: parseInt(lineId, 10) },
        });
        if (!line) throw new ApolloError("No such line exists");
        // this.storeInCache(line.id, line, 100);
        Log("getLineById: ", line);
        return line;
    };

    getManylinesByIds = async (lineIds: string[]) => {
        if (!lineIds || lineIds.length === 0) return [];
        const lines = await this.store.trainLine.findMany({
            where: { id: { in: lineIds.map((lineId) => parseInt(lineId, 10)) } },
        });
        Log("getManylinesByIds: ", lines);
        return lines;
    };
}

export default StationDS;
