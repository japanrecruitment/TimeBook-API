import { APIGatewayProxyResult } from "aws-lambda";
import { Response } from "../../utils/message";
import { UserRole } from "./UserRole";
import { authStrategies } from "./authStrategies";
import { ExecutionPolicy, generatePolicy } from "./generatePolicy";
import { decodeToken } from "@utils/token-helper";

type ApiGatewayEvent = {
    authorizationToken: string | undefined;
    methodArn: any;
};

type Authorizer = (event: ApiGatewayEvent, requiredRoles: UserRole[]) => ExecutionPolicy | APIGatewayProxyResult;

export const authorizer: Authorizer = (event, requiredRoles) => {
    const { authorizationToken, methodArn } = event;
    try {
        const decodedData = decodeToken(authorizationToken, "access");
        if (!decodedData) return Response.error(Response.errorCode.unauthorized, 10000, "Unauthorized");
        for (let role of requiredRoles) {
            if (authStrategies[role](decodedData))
                return generatePolicy(decodedData.id, "Allow", methodArn, decodedData);
        }
        return generatePolicy(null, "Deny", methodArn, {
            error: "unauthorized",
            action: null,
        });
    } catch (error) {
        if (error.name === "TokenExpiredError")
            return generatePolicy(null, "Deny", methodArn, {
                error: "token-expired",
                message: error.message,
                action: "login",
            });
        return generatePolicy(null, "Deny", methodArn, {
            error: "invalid-token",
            message: error.message,
            action: "login",
        });
    }
};
