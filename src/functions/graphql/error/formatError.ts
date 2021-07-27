import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import { GraphQLError } from "graphql";

export default (error: GraphQLError) => {
    try {
        Log("[STARTED]: formatting error", error);
        const { message, locations, path, extensions } = error;
        const { exception, ...exts } = extensions;
        const { stacktrace } = environment.isDev() && (exception || {});
        const info = environment.isDev() ? { locations, path, stacktrace } : undefined;
        const formattedError = { message, ...exts, info };
        Log("[COMPLETED]: formatting error", formattedError);
        return formattedError;
    } catch (error) {
        Log("[FAILED]: formatting error", error);
        return error;
    }
};
