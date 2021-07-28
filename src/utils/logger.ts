import { environment } from "./environment";

export const Log = (...args): void => {
    if (environment.isDev()) {
        console.log(...args);
    }
};
