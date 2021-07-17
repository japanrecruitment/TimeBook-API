import { environment } from "@utils/environment";
import { TokenKind } from "graphql";

type TokenConfigs = {
    [K in TokenKind]: { secret: string; expiresIn: string | number | undefined };
};

export type TokenKind = "access" | "refresh";

export const tokenConfigs: TokenConfigs = {
    access: { secret: environment.TOKEN_SECRET, expiresIn: "6h" },
    refresh: { secret: environment.REFRESH_TOKEN_SECRET, expiresIn: "30d" },
};
