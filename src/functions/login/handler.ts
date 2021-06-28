import { ValidatedEventAPIGatewayProxyEvent } from "../../libs/apiGateway";
import { APIGatewayProxyResult } from "aws-lambda";
import { middyfy } from "../../middlewares";
import schema from "./schema";
import { MessageUtil } from "@utils/message";

import bcrypt from "bcryptjs";
import { LoginResponse } from "./schema";

const login: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
    event
): Promise<APIGatewayProxyResult> => {
    const { email, password }: { email: string; password: string } = event.body;
    try {
        return MessageUtil.success<LoginResponse>({
            email,
            password,
        });
    } catch (error) {
        console.log(error);
    }
};

export const main = middyfy(login);
