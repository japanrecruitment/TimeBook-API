import { authorizer } from "@libs/authorizer";
import { Handler } from "aws-lambda";

export const main: Handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;
    return authorizer(event, ["user"]);
};
