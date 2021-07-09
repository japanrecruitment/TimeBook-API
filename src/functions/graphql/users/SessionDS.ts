import PrismaDataSource from "@libs/PrismaDataSource";
import { GQLError } from "../core";
import UserDS from "./UserDS";
import { comparePassword } from "@utils/authUtils";
import { publicUser } from "@libs/types";
import { JWT } from "@utils/jwtUtil";
import { Log } from "@utils/logger";

class SessionDS extends PrismaDataSource {
    private get sourceIp() {
        return this.context.sourceIp;
    }

    private get userAgent() {
        return this.context.userAgent;
    }

    loginUser = async (email: string, password: string) => {
        if (!email.trim() || !password.trim())
            throw new GQLError({ code: "BAD_REQUEST", message: "Provide all necessary fields" });
        const userDS: UserDS = this.context.dataSources.userDS;
        const user = await userDS.getUserByEmail(email);
        if (!user) throw new GQLError({ code: "BAD_USER_INPUT", message: "User not found" });
        if (!comparePassword(password, user.password))
            throw new GQLError({ code: "BAD_USER_INPUT", message: "Incorrect email password" });
        if (user.suspended) throw new GQLError({ code: "FORBIDDEN", message: "Please contact support" });
        if (!user.emailVerified)
            throw new GQLError({
                code: "FORBIDDEN",
                message: "Email not verified",
                action: "resend-email-verification-code",
            });
        const session = await this.store.session.create({
            data: { ip: this.sourceIp, userAgent: this.userAgent, user: { connect: { id: user.id } } },
        });
        const userData = publicUser(user);
        const jwt = new JWT();
        const token = jwt.sign(user.id, { ...userData, role: user.type }, "accessToken");
        const refreshToken = jwt.sign(session.id, { userId: user.id }, "refreshToken");
        Log("[SUCCESS]: login user ", userData);
        return { user: userData, token, refreshToken };
    };
}

export default SessionDS;
