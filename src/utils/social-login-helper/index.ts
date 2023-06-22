import { Log } from "@utils/logger";
import { verifyFacebook } from "./providers/facebook";
import { verifyGoogle } from "./providers/google";
import { verifyApple } from "./providers/apple";

export type SocialProviders = "google" | "facebook";

type VerifySocialLoginArgs = {
    provider: SocialProviders;
    token: string;
};

export type VerifySocialLoginResponse = {
    email: string;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    profilePhoto: string;
    providerAccountId: string;
};

export const verifySocialLogin = async ({
    provider,
    token,
}: VerifySocialLoginArgs): Promise<VerifySocialLoginResponse | null> => {
    if (provider === "google") {
        try {
            const data = verifyGoogle(token);
            return data;
        } catch (error) {
            Log(error);
            return null;
        }
    }
    if (provider === "facebook") {
        try {
            const data = verifyFacebook(token);
            return data;
        } catch (error) {
            Log(error);
            return null;
        }
    }
    if (provider === "apple") {
        try {
            const data = verifyApple(token);
            return data;
        } catch (error) {
            Log(error);
            return null;
        }
    }

    return null;
};
