import httpJsonBodyParses from "@middy/http-json-body-parser";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import mongooseConnectMiddleware from "./mongooseConnectMiddleware";

export { default as middyfy } from "./middyfy";

const middlewares = [mongooseConnectMiddleware(), httpJsonBodyParses(), doNotWaitForEmptyEventLoop()];
export default middlewares;
