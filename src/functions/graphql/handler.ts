import { ApolloServer } from "apollo-server-lambda";
import { environment, Log } from "@utils/index";
import cache from "./cache";
import context from "./context";
import dataSources from "./dataSources";
import { formatError } from "./error";
import plugins from "./plugins";
import schema from "./schema";

console.log(process.env.NODE_ENV);

const server = new ApolloServer({
    cache,
    context,
    dataSources,
    formatError,
    plugins,
    schema,
    debug: environment.isDev(),
    introspection: environment.isDev(),
});

export const main = server.createHandler();
