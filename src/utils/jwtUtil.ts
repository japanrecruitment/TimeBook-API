import jwt from "jsonwebtoken";
import { environment } from "./environment";

const { TOKEN_SECRET } = environment;

interface TokenUtil<T, K> {
    sign: (id: K, data: T) => string;
    verify: (token: string) => T;
}

export class JWT<T, K> implements TokenUtil<T, K> {
    sign = (id: K, data: T): string => {
        return jwt.sign(data, TOKEN_SECRET, { expiresIn: "6h", jwtid: id });
    };
    verify = (token: string): T => {
        return jwt.sign(token, TOKEN_SECRET);
    };
}
