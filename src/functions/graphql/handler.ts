import { merge } from "lodash";
import { ApolloServer, makeExecutableSchema } from "apollo-server-lambda";
import responseCachePlugin from "apollo-server-plugin-response-cache";

import { environment, Store } from "@utils/index";
import { AuthenticatedUser } from "@libs/authorizer";

import { coreResolvers, coreTypedefs } from "./core";
import { AuthDirective, SelfDirective, UpperFirstLetterDirective } from "./core/directives";

import { UserDS, userResolvers, userTypeDefs } from "./users";

const typeDefs = [coreTypedefs, userTypeDefs];
const resolvers = merge([coreResolvers, userResolvers]);
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

const server = new ApolloServer({
    schema,
    // cache,
    cacheControl: {
        defaultMaxAge: 300,
    },
    dataSources: () => ({
        userDS: new UserDS(Store),
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

        return {
            headers: event.headers,
            functionName: context.functionName,
            event,
            context,
            principal,
        };
    },
    introspection: environment.isDev(),
    playground: environment.isDev(),
    debug: environment.isDev(),
});

export const main = server.createHandler();
