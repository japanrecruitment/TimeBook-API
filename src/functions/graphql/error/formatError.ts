import { Log } from "@utils/index";
import { GraphQLError } from "graphql";

export default (error: GraphQLError) => {
    Log(error);
    const { message, locations, path, extensions } = error;
    const { exception, ...exts } = extensions;
    const { stacktrace } = exception;
    const info = { locations, path, stacktrace };
    const formattedError = { message, ...exts, info };
    return formattedError;
};
