import bcrypt from "bcryptjs";
import { Log } from "./logger";

export const encodePassword = (raw: string): string => {
    try {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(raw, salt);
    } catch (error) {
        Log(error.message);
    }
};

export const matchPassword = (raw: string, encoded: string): boolean => {
    try {
        return bcrypt.compareSync(raw, encoded);
    } catch (error) {
        Log(error.message);
    }
};
