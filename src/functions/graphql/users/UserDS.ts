/**
 * WRAPPER ABOVE PRISMA
 */

import { PrismaClient } from "@prisma/client";
import { DataSource } from "apollo-datasource";
import { ApolloError } from "apollo-server-lambda";

import Log from "@utils/logger";
class UserDS extends DataSource {
    store: PrismaClient;

    context: Object;

    cache: Object;

    constructor(store: PrismaClient) {
        super();
        this.store = store;
    }

    initialize(config) {
        this.context = config.context;
        this.cache = config.cache;
    }

    getAllUsers = async (limit: number, after: number) => {
        const users = await this.store.user.findMany({
            take: limit,
            skip: after,
        });
        console.log("getAllUsers: ", users);
        return users || [];
    };

    getUserById = async (userId: number) => {
        if (!userId) return null;
        const user = await this.store.user.findUnique({
            where: { id: userId },
        });
        if (!user) throw new ApolloError("No such user exists");
        Log("getUserById: ", user);
        return user;
    };

    getManyUserByIds = async (userIds: number[]) => {
        if (!userIds || userIds.length === 0) return [];
        const users = await this.store.user.findMany({
            where: { id: { in: userIds } },
        });
        Log("getManyUserByIds: ", users);
        return users;
    };
}

export default UserDS;
