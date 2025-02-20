import verifyAppleToken from "verify-apple-id-token";
import { Log } from "@utils/logger";
import { VerifySocialLoginResponse } from "..";

export const verifyApple = async (idToken: string): Promise<VerifySocialLoginResponse> => {
    try {
        const jwtClaims = await verifyAppleToken({
            idToken: idToken,
            clientId: ["com.sequence.pocketseq", "host.exp.Exponent"], // TODO: provide proper clientId for web apple sign in
            // nonce: "nonce", // optional
        });

        const { email, sub } = jwtClaims;

        return {
            email,
            emailVerified: true,
            firstName: "",
            lastName: "",
            profilePhoto: null,
            providerAccountId: sub,
        };
    } catch (error) {
        Log(error.message);
        throw new Error("Error validating id_token for Facebook OAuth.");
    }
};
