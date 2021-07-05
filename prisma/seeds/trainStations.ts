import { Station } from "@prisma/client";
// import { trainStationData } from "./data/TrainStationsData";
import { trainStationData } from "./data/TestTrainStationData";

export const stations: Partial<Station>[] = trainStationData;
