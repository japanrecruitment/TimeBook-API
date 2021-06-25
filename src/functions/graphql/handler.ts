import { merge } from "lodash";
import { ApolloServer, makeExecutableSchema } from "apollo-server-lambda";
import { RedisClusterCache } from "apollo-server-cache-redis";
import responseCachePlugin from "apollo-server-plugin-response-cache";
import { environment, dbConn, MessageUtil } from "../../utils";
import { coreResolvers, coreTypedefs } from "./core";
import { AuthDirective, UpperFirstLetterDirective, SelfDirective, I18nDirective } from "./core/directives";
import { CloudflareDS, cloudflareResolvers, cloudflareTypeDefs, VideoDS, VideoSignKeyDS } from "./cloudflare";
import { UserDS, userResolvers, userTypeDefs } from "./users";
import { CourseDS, courseTypeDefs, courseResolvers } from "./courses";
import { UnitDS, unitTypeDefs, unitResolvers } from "./units";
import { LessonDS, lessonTypeDefs, lessonResolvers } from "./lessons";
import { ContentDS, contentResolvers, contentTypeDefs } from "./content";
import { TestDS, testResolvers, testTypeDefs } from "./test";
import { QuizDS, quizTypeDefs, quizResolvers } from "./quiz";
import { AuthenticatedUser } from "@libs/authorizer";
import { PurchaseDS, purchaseResolvers, purchaseTypeDefs } from "./purchase";

const typeDefs = [
    coreTypedefs,
    cloudflareTypeDefs,
    userTypeDefs,
    courseTypeDefs,
    unitTypeDefs,
    lessonTypeDefs,
    contentTypeDefs,
    testTypeDefs,
    quizTypeDefs,
    purchaseTypeDefs,
];
const resolvers = merge([
    coreResolvers,
    cloudflareResolvers,
    userResolvers,
    courseResolvers,
    unitResolvers,
    lessonResolvers,
    contentResolvers,
    testResolvers,
    quizResolvers,
    purchaseResolvers,
]);
const schemaDirectives = {
    upperFirstLetter: UpperFirstLetterDirective,
    self: SelfDirective,
    auth: AuthDirective,
    i18n: I18nDirective,
};

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
        userDS: new UserDS(),
        cloudflareDS: new CloudflareDS(),
        videoDS: new VideoDS(),
        videoSignKeyDS: new VideoSignKeyDS(),
        courseDS: new CourseDS(),
        unitDS: new UnitDS(),
        lessonDS: new LessonDS(),
        contentDS: new ContentDS(),
        testDS: new TestDS(),
        quizDS: new QuizDS(),
        purchaseDS: new PurchaseDS(),
    }),
    plugins: [
        responseCachePlugin({
            sessionId: (requestContext) => {
                return requestContext.request.http.headers.get("sessionid") || null;
            },
        }),
    ],

    context: async ({ event, context }) => {
        // connect to database first

        try {
            await dbConn();
        } catch (error) {
            console.log(error);
            return MessageUtil.error(MessageUtil.errorCode.serverError, error.code, error.message);
        }

        // assign principal with new AuthenticatedUser helper class
        const principal = new AuthenticatedUser(event);

        // get locale from request header
        const locale = event.headers["Locale"] || event.headers["locale"];

        return {
            headers: event.headers,
            functionName: context.functionName,
            event,
            context,
            principal,
            locale,
        };
    },
    introspection: environment.isDev(),
    playground: environment.isDev(),
    debug: environment.isDev(),
});

export const main = server.createHandler({
    cors: { origin: "*", credentials: true },
});
