import { UserRole } from "./UserRole";

type AuthData = { role: string | undefined };

type AuthStrategy = (authData: AuthData) => boolean;

type AuthStrategies = {
    [P in UserRole]: AuthStrategy;
};

const adminStrategy: AuthStrategy = (authData) => {
    const { role } = authData;
    return role !== undefined && role === UserRole.ADMIN;
};

const userStrategy: AuthStrategy = (authData) => {
    const isAdmin = adminStrategy(authData);
    if (isAdmin) return true;

    const { role } = authData;
    return role !== undefined && role === UserRole.USER;
};

const unknownStrategy: AuthStrategy = () => false;

export const authStrategies: AuthStrategies = {
    admin: adminStrategy,
    user: userStrategy,
    unknown: unknownStrategy,
};
