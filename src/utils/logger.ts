import { inspect } from "util";

export const Log = (...args): void => {
    args = args.map((arg) => {
        const inspected = inspect(arg, { colors: false, depth: null });
        // Remove single quotes around strings
        if (typeof arg === "string") {
            return inspected.slice(1, inspected.length - 1); // Remove the first and last characters
        }
        return inspected;
    });
    console.log(...args);
};

export const ForceLog = (...args): void => {
    args = args.map((arg) => inspect(arg, false, null, true));
    console.log(...args);
};
