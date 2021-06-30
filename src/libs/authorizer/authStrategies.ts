import { UserRole } from "./UserRole";

export type AuthData = { role: string | undefined };

type AuthStrategy = (authData: AuthData) => boolean;

type AuthStrategies = {
    [P in UserRole]: AuthStrategy;
};

const adminStrategy: AuthStrategy = (authData) => {
    const { role } = authData;
    return role !== undefined && role === "admin";
};

const userStrategy: AuthStrategy = (authData) => {
    const isAdmin = adminStrategy(authData);
    if (isAdmin) return true;

    const { role } = authData;
    return role !== undefined && role === "user";
};

const hostStrategy: AuthStrategy = (authData) => {
    const isAdmin = adminStrategy(authData);
    if (isAdmin) return true;

    const { role } = authData;
    return role !== undefined && role === "host";
};

const unknownStrategy: AuthStrategy = () => false;

export const authStrategies: AuthStrategies = {
    user: userStrategy,
    host: hostStrategy,
    admin: adminStrategy,
    unknown: unknownStrategy,
};
