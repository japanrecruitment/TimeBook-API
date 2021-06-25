import bcrypt from "bcryptjs";
import schema from "./schema";
import { ValidatedEventAPIGatewayProxyEvent } from "../../libs/apiGateway";
import { middyfy } from "../../middlewares";
import { environment, MessageUtil, getString, getLocale, availableLanguges, getPaymentMethods } from "../../utils";
import { IpStacks } from "../../libs";
import { omitSensitiveFields, UserModel } from "../../model";
import { AuthTokenPayload, encodeAuthToken, UserRole } from "@libs/authorizer";

const login: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const { email, password } = event.body;
    const countryCode = getLocale(event);
    try {
        // Added projection to not include provided attributes to this query
        // chained with .lean() method from mongoose so that it is a regular javascript object and not mongoose document
        // without .lean() we could not remove attributes from user object (for example: remove password from user object)
        const user = await UserModel.findOne(
            { email },
            "-createdAt -updatedAt -verificationToken -resetToken -__v"
        ).lean();
        if (user) {
            //compare password
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                //TODO:Check if user has verified email
                if (!user.isVerified) {
                    return MessageUtil.error(
                        MessageUtil.errorCode.clientError,
                        10001,
                        await getString("verifyEmail", countryCode),
                        {
                            action: "verify-email",
                            email: user.email,
                        }
                    );
                }

                // get ip details
                const userIp = event.requestContext.identity.sourceIp;
                const { country_code, country_name } = await IpStacks.getIpData(userIp);

                const authTokenPayload: AuthTokenPayload = {
                    ...omitSensitiveFields(user),
                    role: UserRole.USER, // set default role as user
                    countryCode: country_code || "JP", // set default country as Japan
                    countryName: country_name || "Japan", // set default country as Japan
                };
                const token = encodeAuthToken(authTokenPayload);

                // retrieve app configuration for user based on country
                const appConfig = {
                    availableLanguges,
                    paymentMethods: getPaymentMethods(authTokenPayload.countryCode),
                };

                return MessageUtil.success({ token, user, appConfig });
            } else {
                return MessageUtil.error(
                    MessageUtil.errorCode.unauthorized,
                    10001,
                    await getString("incorrectCreds", countryCode)
                );
            }
        } else {
            return MessageUtil.error(
                MessageUtil.errorCode.notFound,
                10001,
                await getString("userNotFound", countryCode)
            );
        }
    } catch (error) {
        console.error(error);
        return MessageUtil.error(
            MessageUtil.errorCode.serverError,
            error.code,
            await getString("sthWentWrong", countryCode)
        );
    }
};

export const main = middyfy(login);
