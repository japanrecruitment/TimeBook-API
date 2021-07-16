import jwt from "jsonwebtoken";
import { UserRole } from "./UserRole";

type AuthTokenPayload = {
    id: string;
    roles: UserRole[];
};

type TokenType = "refresh" | "access";

type AuthTokenEncoder = (payload: Partial<AuthTokenPayload>, type: TokenType) => string;

type AuthTokenDecoder = (bearerToken: string | undefined, type: TokenType) => AuthTokenPayload | undefined;

const encodeAuthToken: AuthTokenEncoder = (payload, type) => {
    const tokenSecret = type === "refresh" ? process.env.REFRESH_TOKEN_SECRET : process.env.TOKEN_SECRET;
    const expiresIn = type === "refresh" ? "30d" : "6h";
    const jwtid = payload.id;
    return jwt.sign(payload, tokenSecret, { expiresIn, jwtid });
};

const decodeAuthToken: AuthTokenDecoder = (bearerToken, type) => {
    if (!bearerToken) return;
    const token = bearerToken.split(" ")[1];
    if (!token) return;
    const tokenSecret = type === "refresh" ? process.env.REFRESH_TOKEN_SECRET : process.env.TOKEN_SECRET;
    return jwt.verify(token, tokenSecret);
};

export { decodeAuthToken, encodeAuthToken, AuthTokenPayload };
