import { TrainLine } from "@prisma/client";
import { trainLinesData } from "./data/TrainLinesData";

export const trainLines: Partial<TrainLine>[] = trainLinesData;
