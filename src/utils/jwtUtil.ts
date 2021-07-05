import jwt from "jsonwebtoken";
import { Log } from ".";
import { environment } from "./environment";

const { TOKEN_SECRET, REFRESH_TOKEN_SECRET } = environment;

interface TokenUtil<T, K> {
    sign: (id: K, data: T, kind: "accessToken" | "refreshToken") => string;
    verify: (token: string, kind: "accessToken" | "refreshToken") => T;
}

export class JWT<T, K> implements TokenUtil<T, K> {
    sign = (id: K, data: T, kind: "accessToken" | "refreshToken"): string => {
        if (kind === "refreshToken") {
            return jwt.sign(data, REFRESH_TOKEN_SECRET, { expiresIn: "30d", jwtid: id });
        }
        return jwt.sign(data, TOKEN_SECRET, { expiresIn: "6h", jwtid: id });
    };
    verify = (token: string, kind: "accessToken" | "refreshToken"): T => {
        // get token from Bearer Token
        // simply get rid of 'Bearer ' prefix from authentication token
        token = token.split(" ")[1];
        if (kind === "refreshToken") {
            return jwt.verify(token, REFRESH_TOKEN_SECRET);
        }
        return jwt.verify(token, TOKEN_SECRET);
    };
}
