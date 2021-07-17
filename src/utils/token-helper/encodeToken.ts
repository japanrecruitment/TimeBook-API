import { sign, SignOptions } from "jsonwebtoken";
import { TokenKind, tokenConfigs } from "./tokenConfigs";

type SignPayload = string | Buffer | object;

type EncodeToken = <P extends SignPayload = SignPayload>(payload: P, kind: TokenKind, options?: SignOptions) => string;

export const encodeToken: EncodeToken = (payload, kind, options) => {
    const secret = tokenConfigs[kind].secret;
    const expiresIn = options.expiresIn || tokenConfigs[kind].expiresIn;
    return sign(payload, secret, { ...options, expiresIn });
};
