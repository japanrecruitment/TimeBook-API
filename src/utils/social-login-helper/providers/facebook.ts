import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import axios from "axios";
import { VerifySocialLoginResponse } from "..";

export const verifyFacebook = async (idToken: string): Promise<VerifySocialLoginResponse> => {
    try {
        const verifyToken = await axios.get(
            `https://graph.facebook.com/debug_token?input_token=${idToken}&access_token=${environment.FACEBOOK_CLIENT_ID}}|${environment.FACEBOOK_CLIENT_SECRET}`
        );

        Log("verifyToken", verifyToken.data);

        const getUserDetails = await axios.get(
            `https://graph.facebook.com/10167296965775048?fields=id,first_name,last_name,email&access_token=${idToken}`
        );

        Log("getUserDetails", getUserDetails.data);

        const { email, first_name, last_name, id } = getUserDetails.data;

        return {
            email,
            emailVerified: true,
            firstName: first_name,
            lastName: last_name,
            profilePhoto: null,
            providerAccountId: id,
        };
    } catch (error) {
        Log(error.message);
        throw new Error("Error validating id_token for Facebook OAuth.");
    }
};
