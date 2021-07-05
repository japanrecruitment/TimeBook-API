import { PrismaClient } from "@prisma/client";
import { environment, Log } from "../src/utils";

import { users, userProcessor } from "./seeds/users";
import { prefectures } from "./seeds/prefecture";
import { stations } from "./seeds/trainStations";
import { trainLines } from "./seeds/trainLines";

const prisma = new PrismaClient();

const main = async () => {
    // run only in the dev environment
    if (environment.isDev()) {
        Log("Running on dev environment");
        // Call seedTable function for each schema
        // await seedTable("user", users, userProcessor);
        // await seedTable("prefecture", prefectures, null);
        // await seedTable("trainLine", trainLines, null);
        await seedTable("station", stations, null);
    } else {
        Log("Looks like you're trying to seed on production environment...");
        throw new Error("Can't seed on production environment!");
    }
};

type DataProcessor<T> = (T) => T;

const seedTable = async <T>(schema: string, data: T[], dataProcessor: DataProcessor<T> | null): Promise<void> => {
    try {
        if (dataProcessor) {
            Log(`${schema}: Processing data...`);
            data = data.map(dataProcessor);
        }
        // clear out the existing data
        Log(`${schema}: Clearing old records...`);
        await prisma[schema].deleteMany();
        Log(`${schema}: Finish clearing data`);

        Log(`${schema}: Seeding new data...`);
        await prisma[schema].createMany({ data });
        Log(`${schema}: Seeding complete`);
        Log(`...........................`);
    } catch (error) {
        throw new Error(`Error while seeding ${schema}: ${error.message}`);
    }
};

main()
    .catch((e) => {
        Log(e.message);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
