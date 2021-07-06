import { APIGatewayProxyResult } from "aws-lambda";

import { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { middyfy } from "@middlewares/index";
import { Response, Log, Store, comparePassword } from "@utils/index";

import schema, { LoginResponse } from "./schema";

import { User } from "@prisma/client";
import { omit, publicUser } from "@libs/types";
import { JWT } from "@utils/jwtUtil";

const login: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event): Promise<APIGatewayProxyResult> => {
    const { email, password }: { email: string; password: string } = event.body;
    try {
        if (!email.trim() || !password.trim()) {
            return Response.error(400, 0, "Provide all necessary fields");
        }
        const user: User = await Store.user.findUnique({
            where: { email },
        });
        Log(user);
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
        // Check if email verified
        if (!user.emailVerified) {
            return Response.error(400, 5, "Email not verified", { action: "resend-email-verification-code" });
        }

        // create session
        const { sourceIp: ip, userAgent } = event.requestContext.identity;
        const newSession = {
            ip,
            userAgent,
        };
        // store session and id of new sessioin
        const { userId, id: sessionId } = await Store.session.create({ data: { userId: user.id, ...newSession } });

        // ommit sensitive fields from User
        const publicUserData = publicUser(user);

        // sign Tokens
        const jwt = new JWT();
        const token = jwt.sign(user.id, { ...publicUserData, role: user.type }, "accessToken");
        const refreshToken = jwt.sign(sessionId, { userId }, "refreshToken");

        return Response.success<LoginResponse>({
            user: publicUserData,
            token,
            refreshToken,
        });
    } catch (error) {
        console.log(error);
    }
};

export const main = middyfy(login);
