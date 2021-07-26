import { ApolloError } from "apollo-server-lambda";

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

export default class GqlError extends ApolloError {
    constructor(args: GQLErrorConstructorArgs) {
        const { code, message, ...extensions } = args;
        super(message, code || "INTERNAL_SERVER_ERROR", extensions);

        Object.defineProperty(this, "name", { value: "GqlError" });
    }
}
