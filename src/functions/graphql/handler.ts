import { merge } from "lodash";
import { ApolloServer, makeExecutableSchema } from "apollo-server-lambda";
import responseCachePlugin from "apollo-server-plugin-response-cache";
import { environment } from "../../utils";
import { coreResolvers, coreTypedefs } from "./core";
import { UpperFirstLetterDirective } from "./core/directives";
import { UserDS, userResolvers, userTypeDefs } from "./users";
import { PrismaClient } from "@prisma/client";

const typeDefs = [coreTypedefs, userTypeDefs];
const resolvers = merge([coreResolvers, userResolvers]);
const schemaDirectives = {
    upperFirstLetter: UpperFirstLetterDirective,
    // self: SelfDirective,
    // auth: AuthDirective,
};

/* tslint:disable:top-level-await */
// const db = createStore();

const store = new PrismaClient();

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
        userDS: new UserDS(store),
    }),
    plugins: [
        responseCachePlugin({
            sessionId: (requestContext) => {
                return (
                    requestContext.request.http.headers.get("sessionid") || null
                );
            },
        }),
    ],

    // context: async ({ event, context }) => {
    //     // connect to database first

    //     // try {
    //     //     await dbConn();
    //     // } catch (error) {
    //     //     console.log(error);
    //     //     return MessageUtil.error(
    //     //         MessageUtil.errorCode.serverError,
    //     //         error.code,
    //     //         error.message
    //     //     );
    //     // }

    //     // assign principal with new AuthenticatedUser helper class
    //     const principal = new AuthenticatedUser(event);

    //     // get locale from request header
    //     const locale = event.headers["Locale"] || event.headers["locale"];

    //     return {
    //         headers: event.headers,
    //         functionName: context.functionName,
    //         event,
    //         context,
    //         principal,
    //         locale,
    //     };
    // },
    introspection: environment.isDev(),
    playground: environment.isDev(),
    debug: environment.isDev(),
});

export const main = server.createHandler();
