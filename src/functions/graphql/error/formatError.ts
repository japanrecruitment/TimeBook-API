import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import { GraphQLError } from "graphql";

export default (error: GraphQLError) => {
    Log("original error", error);
    try {
        const { message, locations, path, extensions } = error;
        const { exception, ...exts } = extensions;
        const { stacktrace } = exception;
        const info = environment.isDev() ? { locations, path, stacktrace } : undefined;
        const formattedError = { message, ...exts, info };
        return formattedError;
    } catch (error) {
        Log("Something went wrong in format error", error);
        return error;
    }
};
