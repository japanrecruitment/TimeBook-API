import { ApolloError } from "apollo-server-lambda";
import { GraphQLError } from "graphql";

type ErrorCode =
    | "BAD_REQUEST"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "BAD_USER_INPUT"
    | "INTERNAL_SERVER_ERROR";

type GQLErrorConstructorArgs =
    | {
          code: ErrorCode;
          message: string;
          action: string;
      }
    | Record<string, any>;

class GQLError extends ApolloError {
    constructor(args: GQLErrorConstructorArgs) {
        const { code, message, ...extensions } = args;
        super(message, code || "INTERNAL_SERVER_ERROR", extensions);

        Object.defineProperty(this, "name", { value: "GQLError" });
    }

    static formatError(error: GraphQLError) {
        const { message, locations, path, extensions } = error;
        const { exception, ...exts } = extensions;
        const { stacktrace } = exception;
        const info = { locations, path, stacktrace };
        const formattedError = { message, ...exts, info };
        return formattedError;
    }
}

export default GQLError;
