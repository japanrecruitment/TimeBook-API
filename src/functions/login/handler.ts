import bcrypt from "bcryptjs";
import util from "util";
import { APIGatewayProxyResult } from "aws-lambda";

import { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { middyfy } from "@middlewares/index";
import { Response, Log } from "@utils/index";

import schema, { LoginResponse } from "./schema";

const login: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
    event
): Promise<APIGatewayProxyResult> => {
    const { email, password }: { email: string; password: string } = event.body;
    try {
        Log({ hello: "world" }, { another: "object" });
        console.log();
        return Response.success<LoginResponse>({
            email,
            password,
        });
    } catch (error) {
        console.log(error);
    }
};

export const main = middyfy(login);
