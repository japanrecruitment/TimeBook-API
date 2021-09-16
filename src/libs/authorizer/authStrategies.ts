import { Log } from "@utils/logger";
import { UserRole } from "./UserRole";

export type AuthData = { roles: string[] | undefined };

type AuthStrategy = (authData: AuthData) => boolean;

type AuthStrategies = {
    [P in UserRole]: AuthStrategy;
};

const adminStrategy: AuthStrategy = (authData) => {
    const { roles } = authData;
    return roles !== undefined && roles.includes("admin");
};

const userStrategy: AuthStrategy = (authData) => {
    const isAdmin = adminStrategy(authData);
    if (isAdmin) return true;

    const { roles } = authData;
    return roles !== undefined && roles.includes("user");
};

const hostStrategy: AuthStrategy = (authData) => {
    const isAdmin = adminStrategy(authData);
    if (isAdmin) return true;

    const { roles } = authData;
    return roles !== undefined && roles.includes("host");
};

const unknownStrategy: AuthStrategy = () => false;

export const authStrategies: AuthStrategies = {
    user: userStrategy,
    host: hostStrategy,
    admin: adminStrategy,
    unknown: unknownStrategy,
};
