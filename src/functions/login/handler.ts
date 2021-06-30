import bcrypt from "bcryptjs";
import util from "util";
import { APIGatewayProxyResult } from "aws-lambda";

import { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { middyfy } from "@middlewares/index";
import { Response, Log, Store, comparePassword } from "@utils/index";

import schema, { LoginResponse } from "./schema";

const login: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event): Promise<APIGatewayProxyResult> => {
    const { email, password }: { email: string; password: string } = event.body;
    try {
        if (!email.trim() || !password.trim()) {
            return Response.error(400, 0, "Provide all necessary fields");
        }
        const user = await Store.user.findUnique({
            where: { email },
        });

        if (!user) {
            return Response.error(404, 3, "User not found");
        }
        // Check password match
        if (!comparePassword(password, user.password)) {
            return Response.error(403, 3, "Not match");
        }

        // Check suspended
        if (user.suspended) {
            return Response.error(400, 4, "Please contact support.");
        }
        if (!user.emailVerified) {
            return Response.error(400, 5, "Email not verified", { action: "resend-email-verification-code" });
        }

        // sign JWT

        return Response.success<LoginResponse>({
            email,
            password,
        });
    } catch (error) {
        console.log(error);
    }
};

export const main = middyfy(login);
