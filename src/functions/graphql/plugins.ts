import {
    ApolloServerPluginCacheControl,
    ApolloServerPluginLandingPageDisabled,
    ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import responseCachePlugin from "apollo-server-plugin-response-cache";
import { environment } from "@utils/environment";

const playground = environment.isDev()
    ? ApolloServerPluginLandingPageGraphQLPlayground()
    : ApolloServerPluginLandingPageDisabled();

const cacheControl = ApolloServerPluginCacheControl({
    calculateHttpHeaders: environment.isDev(),
});

const responseCache = responseCachePlugin({
    sessionId: (requestContext) => {
        return requestContext.request.http.headers.get("sessionid") || null;
    },
});

export default [playground, cacheControl, responseCache];
