import { Response } from "../../utils/message";
import { UserRole } from "./UserRole";
import { decodeAuthToken } from "./AuthTokenHandler";
import { authStrategies } from "./authStrategies";
import { generatePolicy } from "./generatePolicy";

type ApiGatewayEvent = {
    authorizationToken: string | undefined;
    methodArn: any;
};

type Authorizer = (event: ApiGatewayEvent, requiredRole: UserRole) => void;

export const authorizer: Authorizer = (event, requiredRole) => {
    try {
        const decodedData = decodeAuthToken(event.authorizationToken);
        if (!decodedData)
            return Response.error(
                Response.errorCode.unauthorized,
                10000,
                "Unauthorized"
            );
        if (authStrategies[requiredRole](decodedData))
            return generatePolicy(
                decodedData.id,
                "Allow",
                event.methodArn,
                decodedData
            );
        return generatePolicy(null, "Deny", event.methodArn, {
            error: "unauthorized",
            action: null,
        });
    } catch (error) {
        if (error.name === "TokenExpiredError")
            return generatePolicy(null, "Deny", event.methodArn, {
                error: "token-expired",
                message: error.message,
                action: "login",
            });
        return generatePolicy(null, "Deny", event.methodArn, {
            error: "invalid-token",
            message: error.message,
            action: "login",
        });
    }
};
