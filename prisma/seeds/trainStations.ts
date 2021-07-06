import { Station } from "@prisma/client";
import { trainStationData } from "./data/TrainStationsData";
// import { trainStationData } from "./data/TestTrainStationData";

export const stations: Partial<Station>[] = trainStationData;

export const stationProcessor = (station: Partial<Station> & { stationGroupCode: number }): Partial<Station> => {
    delete station.stationGroupCode;
    return station;
};
