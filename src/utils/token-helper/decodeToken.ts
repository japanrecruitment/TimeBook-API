import { verify } from "jsonwebtoken";
import { TokenKind, tokenConfigs } from "./tokenConfigs";

type DecodeToken = <P = any>(token: string, kind: TokenKind) => P | undefined;

export const decodeToken: DecodeToken = <P>(token, kind) => {
    if (!token) return;
    token = token.split(" ")[1];
    if (!token) return;
    const secret = tokenConfigs[kind].secret;
    return verify(token, secret) as P;
};
