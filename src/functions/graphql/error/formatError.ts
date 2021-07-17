import { environment } from "@utils/environment";
import { GraphQLError } from "graphql";

export default (error: GraphQLError) => {
    const { message, locations, path, extensions } = error;
    const { exception, ...exts } = extensions;
    const { stacktrace } = exception;
    const info = environment.isDev() ? { locations, path, stacktrace } : undefined;
    const formattedError = { message, ...exts, info };
    return formattedError;
};
