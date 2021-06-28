import httpJsonBodyParses from "@middy/http-json-body-parser";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";

export { default as middyfy } from "./middyfy";

const middlewares = [httpJsonBodyParses(), doNotWaitForEmptyEventLoop()];
export default middlewares;
