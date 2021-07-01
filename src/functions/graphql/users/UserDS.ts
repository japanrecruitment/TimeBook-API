import { ApolloError } from "apollo-server-lambda";
import { Log } from "@utils/index";
import PrismaDataSource from "@libs/PrismaDataSource";
class UserDS extends PrismaDataSource {
    getAllUsers = async (limit: number, after: number) => {
        const users = await this.store.user.findMany({
            take: limit,
            skip: after,
        });
        Log("getAllUsers: ", users);
        return users || [];
    };

    getUserById = async (userId: string) => {
        if (!userId) return null;
        const cacheDoc = await this.fetchFromCache(userId);
        if (cacheDoc) return cacheDoc;
        const user = await this.store.user.findUnique({
            where: { id: userId },
        });
        if (!user) throw new ApolloError("No such user exists");
        // this.storeInCache(user.id, user, 100);
        Log("getUserById: ", user);
        return user;
    };

    getManyUserByIds = async (userIds: string[]) => {
        if (!userIds || userIds.length === 0) return [];
        const users = await this.store.user.findMany({
            where: { id: { in: userIds } },
        });
        Log("getManyUserByIds: ", users);
        return users;
    };
}

export default UserDS;
