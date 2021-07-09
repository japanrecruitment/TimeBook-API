import { merge } from "lodash";
import { ApolloServer, makeExecutableSchema } from "apollo-server-lambda";
import { RedisCache } from "apollo-server-cache-redis";
import responseCachePlugin from "apollo-server-plugin-response-cache";
import { environment } from "@utils/index";
import { AuthenticatedUser } from "@libs/authorizer";
import { coreResolvers, coreTypedefs } from "./core";
import { AuthDirective, SelfDirective, UpperFirstLetterDirective } from "./core/directives";
import { SessionDS, UserDS, userResolvers, userTypeDefs } from "./users";
import { StationDS, stationResolvers, stationTypeDefs } from "./stations";
import GQLError from "./core/GQLError";

const typeDefs = [coreTypedefs, userTypeDefs, stationTypeDefs];

const resolvers = merge(coreResolvers, userResolvers, stationResolvers);

const schemaDirectives = {
    upperFirstLetter: UpperFirstLetterDirective,
    self: SelfDirective,
    auth: AuthDirective,
};

/* tslint:disable:top-level-await */
const schema = makeExecutableSchema({
    typeDefs,
    schemaDirectives,
    resolvers,
});

const cache = new RedisCache({
    host: "127.0.0.1",
    port: 6379,
    connectTimeout: 5000,
    reconnectOnError: function (err) {
        console.log("Reconnect on error", err);
        var targetError = "READONLY";
        if (err.message.slice(0, targetError.length) === targetError) {
            // Only reconnect when the error starts with "READONLY"
            return true;
        }
    },
    retryStrategy: function (times) {
        console.log("Redis Retry", times);
        if (times >= 3) {
            return undefined;
        }
        var delay = Math.min(times * 50, 2000);
        return delay;
    },
});

const server = new ApolloServer({
    schema,
    cache,
    cacheControl: {
        calculateHttpHeaders: environment.isDev(),
        stripFormattedExtensions: !environment.isDev(),
    },
    formatError: GQLError.formatError,
    dataSources: () => ({
        userDS: new UserDS(),
        sessionDS: new SessionDS(),
        stationDS: new StationDS(),
    }),
    plugins: [
        responseCachePlugin({
            sessionId: (requestContext) => {
                return requestContext.request.http.headers.get("sessionid") || null;
            },
        }),
    ],
    context: async ({ event, context }) => {
        // assign principal with new AuthenticatedUser helper class
        const principal = new AuthenticatedUser(event);

        const { sourceIp, userAgent } = event.requestContext.identity;

        return {
            headers: event.headers,
            functionName: context.functionName,
            event,
            context,
            principal,
            sourceIp,
            userAgent,
        };
    },
    introspection: environment.isDev(),
    playground: environment.isDev(),
    debug: environment.isDev(),
});

export const main = server.createHandler();
