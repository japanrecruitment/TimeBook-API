import bcrypt from "bcryptjs";
import util from "util";
import { APIGatewayProxyResult } from "aws-lambda";

import { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { middyfy } from "@middlewares/index";
import { Response, Log, store, encodePassword } from "@utils/index";

import schema, { RegisterParams, RegisterResponse, RegisterError } from "./schema";

const login: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event): Promise<APIGatewayProxyResult> => {
    try {
        const { email, password, firstName, lastName, firstNameKana, lastNameKana }: RegisterParams = event.body;

        if (
            email.trim() &&
            password.trim() &&
            firstName.trim() &&
            lastName.trim() &&
            firstNameKana.trim() &&
            lastNameKana.trim()
        ) {
            const data = await store.user.create({
                data: { email, password: encodePassword(password), firstName, lastName, firstNameKana, lastNameKana },
            });

            console.log(data);
            // TODO: generate & store email verification code
            // TODO: send email verification code to queue
            return Response.success<RegisterResponse>({ message: "success" });
        } else {
            return Response.error<RegisterError>(400, 1, "All fields are necessary", { action: "register" });
        }
    } catch (error) {
        Log(error);
        if (error.code === "P2002") {
            const errorMessage = error.meta.target.map((field) => `${field} already exists.`).join("\n");
            return Response.error<RegisterError>(400, 2, errorMessage, { action: "register" });
        }
    }
};

export const main = middyfy(login);
