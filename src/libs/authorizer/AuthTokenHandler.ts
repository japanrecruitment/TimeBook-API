import jwt from "jsonwebtoken";
import { UserRole } from "./UserRole";

type AuthTokenPayload = {
    id: string;
    role: UserRole;
    countryCode: string | undefined;
    countryName: string | undefined;
};

type AuthTokenEncoder = (payload: AuthTokenPayload) => string;

type AuthTokenDecoder = (bearerToken: string | undefined) => AuthTokenPayload | undefined;

const encodeAuthToken: AuthTokenEncoder = (payload) => {
    return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "12h" });
};

const decodeAuthToken: AuthTokenDecoder = (bearerToken) => {
    if (!bearerToken) return;
    const token = bearerToken.split(" ")[1];
    if (!token) return;
    return jwt.verify(token, process.env.TOKEN_SECRET);
};

export { decodeAuthToken, encodeAuthToken, AuthTokenPayload };
