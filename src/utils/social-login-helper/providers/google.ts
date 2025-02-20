import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import { GqlError } from "src/functions/graphql/error";
import { VerifySocialLoginResponse } from "..";

const { OAuth2Client } = require("google-auth-library");

const client_web = new OAuth2Client(environment.GOOGLE_AUTH_WEB_CLIENT_ID);
const client_ios = new OAuth2Client(environment.GOOGLE_AUTH_IOS_CLIENT_ID);
const client_android = new OAuth2Client(environment.GOOGLE_AUTH_ANDROID_CLIENT_ID);

export const verifyGoogle = async (idToken: string): Promise<VerifySocialLoginResponse> => {
    try {
        let payload = null;
        try {
            const ticket = await client_web.verifyIdToken({ idToken, audience: environment.GOOGLE_AUTH_WEB_CLIENT_ID });
            payload = ticket.getPayload();
        } catch (error) {
            Log("Google auth client is not WEB");
        }

        try {
            const ticket = await client_ios.verifyIdToken({ idToken, audience: environment.GOOGLE_AUTH_IOS_CLIENT_ID });
            payload = ticket.getPayload();
        } catch (error) {
            Log("Google auth client is not iOS");
        }

        try {
            const ticket = await client_android.verifyIdToken({
                idToken,
                audience: environment.GOOGLE_AUTH_ANDROID_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (error) {
            Log("Google auth client is not Android");
        }

        if (payload === null) {
            Log("Could not authenticate Google login.");
            throw new GqlError({ code: "FORBIDDEN", message: "Could not authenticate Google login." });
        }

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
