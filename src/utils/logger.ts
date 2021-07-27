import util from "util";
import { environment } from "./environment";

export const Log = (...args): void => {
    if (environment.isDev()) {
        args.map((info) => {
            console.log(util.inspect(info, false, null, true));
        });
    }
};
