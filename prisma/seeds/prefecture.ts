import { Prefecture } from "@prisma/client";
import { prefectureData } from "./data/PrefectureData";

export const prefectures: Partial<Prefecture>[] = prefectureData;
