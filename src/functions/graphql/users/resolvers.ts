import { AuthenticatedUser } from "@libs/authorizer";
import UserDS from "./UserDS";

export default {
    Query: {
        getUserById: async (_, { userId }, context, info) => {
            const userDS: UserDS = context.dataSources.userDS;
            const result = await userDS.getUserById(userId);
            info.cacheControl.setCacheHint({ maxAge: 60, scope: "PUBLIC" });
            return result;
        },
        getAllUsers: async (_, __, context, info) => {
            const userDS: UserDS = context.dataSources.userDS;
            const result = await userDS.getAllUsers(10, 0);
            info.cacheControl.setCacheHint({ maxAge: 60, scope: "PUBLIC" });
            return result;
        },

        me: async (_, __, context, info) => {
            // principal class in context is now available for accessing the user AKA principal who called this query
            // principal class has three getter methods
            // id = returns id of principal who made the request
            // role = returns role of principal "user" or "admin"
            // claims = returns all the claims made in authentication Token
            const principal: AuthenticatedUser = context.principal;
            const userDS: UserDS = context.dataSources.userDS;
            const me = await userDS.getUserById(principal.id);
            info.cacheControl.setCacheHint({ maxAge: 0, scope: "PRIVATE" });
            return me;
        },
    },
    // Mutation: {
    //     updateProfile: async (_, { user }, context) => {
    //         const principal: AuthenticatedUser = context.principal;
    //         const userDS: UserDS = context.dataSources.userDS;
    //         return await userDS.updateProfile({ ...user, id: principal.id });
    //     },
    // },
};
