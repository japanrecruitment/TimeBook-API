import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import { VerifySocialLoginResponse } from "..";

const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(environment.GOOGLE_AUTH_CLIENT_ID);

export const verifyGoogle = async (idToken: string): Promise<VerifySocialLoginResponse> => {
    try {
        const ticket = await client.verifyIdToken({ idToken, audience: environment.GOOGLE_AUTH_CLIENT_ID });
        const payload = ticket.getPayload();
        const { sub, email, email_verified, given_name, family_name, picture } = payload;
        return {
            email,
            emailVerified: email_verified,
            firstName: given_name,
            lastName: family_name,
            profilePhoto: picture,
            providerAccountId: sub,
        };
    } catch (error) {
        Log(error);
        throw new Error("Error validating id_token for Google OAuth.");
    }
};
