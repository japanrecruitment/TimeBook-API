import { Log } from "@utils/logger";
import { verifyGoogle } from "./providers/google";

type VerifySocialLoginArgs = {
    provider: "google";
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
    return null;
};
