import { inspect } from "util";
import { environment } from "./environment";

export const Log = (...args): void => {
    if (environment.isDev()) {
        args = args.map((arg) => inspect(arg, false, null, true));
        console.log(...args);
    }
};
