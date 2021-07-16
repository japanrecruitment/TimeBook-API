import { APIGatewayProxyResult } from "aws-lambda";
import { Response } from "../../utils/message";
import { UserRole } from "./UserRole";
import { authStrategies } from "./authStrategies";
import { ExecutionPolicy, generatePolicy } from "./generatePolicy";
import { Log, JWT } from "@utils/index";

type ApiGatewayEvent = {
    authorizationToken: string | undefined;
    methodArn: any;
};

type Authorizer = (event: ApiGatewayEvent, requiredRoles: UserRole[]) => ExecutionPolicy | APIGatewayProxyResult;

export const authorizer: Authorizer = (event, requiredRoles) => {
    try {
        const jwt = new JWT();
        const decodedData: any = jwt.verify(event.authorizationToken, "accessToken");
        if (!decodedData) return Response.error(Response.errorCode.unauthorized, 10000, "Unauthorized");
        for (let role of requiredRoles) {
            if (authStrategies[role](decodedData))
                return generatePolicy(decodedData.id, "Allow", event.methodArn, decodedData);
        }
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
