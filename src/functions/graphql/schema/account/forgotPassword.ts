import { IFieldResolver } from "@graphql-tools/utils";
import { randomNumberOfNDigits } from "@utils/compute";
import { addEmailToQueue, ResetPasswordData } from "@utils/email-helper";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type ForgotPassword = IFieldResolver<any, Context, Record<"email", string>, Promise<Result>>;

const forgotPassword: ForgotPassword = async (_, { email }, { store, dataSources }) => {
    email = email.toLocaleLowerCase(); // change email to lowercase

    const account = await store.account.findUnique({
        where: { email },
        include: { userProfile: true, companyProfile: true },
    });
    if (!account) throw new GqlError({ code: "NOT_FOUND", message: "User with the given email not found" });

    Log(account);
    let recipientName = "";
    if (account.profileType === "UserProfile") {
        recipientName = `${account.userProfile.lastName} ${account.userProfile.firstName}`;
    } else if (account.profileType === "CompanyProfile") {
        recipientName = account.companyProfile.name;
    }

    const verificationCode = randomNumberOfNDigits(6);
    dataSources.redis.store(`reset-password-verification-code-${email}`, verificationCode, 600);

    await addEmailToQueue<ResetPasswordData>({
        template: "reset-password",
        recipientEmail: email,
        recipientName,
        verificationCode,
    });

    return {
        message: `Verificaiton code sent successfully to ${email}. Please check your email.`,
        action: "veriy-reset-password-code",
    };
};

export const forgotPasswordTypeDefs = gql`
    type Mutation {
        forgotPassword(email: String!): Result!
    }
`;

export const forgotPasswordResolvers = {
    Mutation: { forgotPassword },
};
