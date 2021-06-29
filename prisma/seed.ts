import { users } from "./seeds/users";
import { PrismaClient } from "@prisma/client";
import { encodePassword, environment, Log } from "../src/utils";
const prisma = new PrismaClient();

const main = async () => {
    if (environment.isDev()) {
        Log("Running on dev environment");
        Log("Clearing old records...");
        await prisma.user.deleteMany();
        Log("Finished clearing data");
        Log("Seeding new records...");
        const processedUsers = users.map((user) => {
            user.password = encodePassword(user.password);
            return user;
        });
        await prisma.user.createMany({ data: processedUsers });
    } else {
        Log("Looks like you're trying to seed on production environment...");
        throw new Error("Can't seed on production environment!");
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
