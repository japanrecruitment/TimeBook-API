import { Handler } from "aws-lambda";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import httpJsonBodyParses from "@middy/http-json-body-parser";
import httpHeaderNormalizer from "@middy/http-header-normalizer";

const middyfy = (handler: Handler, preventTimeoout: boolean = false) => {
    const middlewares = [httpHeaderNormalizer({ canonical: true }), httpJsonBodyParses()];

    // if preventTimeout is true add doNotWaitForEmptyEventLoop middleware.
    // This middleware sets context.callbackWaitsForEmptyEventLoop property to false
    // This will prevent Lambda from timing out because of open database connections, etc.
    preventTimeoout && middlewares.push(doNotWaitForEmptyEventLoop());

    return middy(handler).use(middlewares);
};

export default middyfy;
