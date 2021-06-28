import { PrismaClient } from "@prisma/client";

export const createStore = async function () {
    return new PrismaClient();
};
