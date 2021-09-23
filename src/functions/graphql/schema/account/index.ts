import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { merge } from "lodash";
import { forgotPasswordResolvers, forgotPasswordTypeDefs } from "./forgotPassword";
import { loginResolvers, loginTypeDefs } from "./login";
import { mySessionsResolvers, mySessionsTypeDefs } from "./mySessions";
import { profileResolvers, profileTypeDefs } from "./profile";
import { refreshTokenResolvers, refreshTokenTypeDefs } from "./refreshToken";
import { registerUserResolvers, registerUserTypeDefs } from "./registerUser";
import { resendVerificationCodeResolvers, resendVerificationCodeTypeDefs } from "./resendVerificationCode";
import { resetPasswordResolvers, resetPasswordTypeDefs } from "./resetPassword";
import { verifyEmailResolvers, verifyEmailTypeDefs } from "./verifyEmail";
import { verifyResetPasswordRequestResolvers, verifyResetPasswordRequestTypeDefs } from "./verifyResetPasswordRequest";
import { hostResolvers, hostTypeDefs } from "./host";
import { registerHostResolvers, registerHostTypeDefs } from "./registerHost";
import { registerCompanyResolvers, registerCompanyTypeDefs } from "./registerCompany";

export const accountTypeDefs = mergeTypeDefs([
    forgotPasswordTypeDefs,
    loginTypeDefs,
    mySessionsTypeDefs,
    profileTypeDefs,
    refreshTokenTypeDefs,
    registerHostTypeDefs,
    registerUserTypeDefs,
    registerCompanyTypeDefs,
    resendVerificationCodeTypeDefs,
    resetPasswordTypeDefs,
    verifyEmailTypeDefs,
    verifyResetPasswordRequestTypeDefs,
    hostTypeDefs,
]);

export const accountResolvers = mergeResolvers([
    forgotPasswordResolvers,
    loginResolvers,
    mySessionsResolvers,
    profileResolvers,
    refreshTokenResolvers,
    registerHostResolvers,
    registerUserResolvers,
    registerCompanyResolvers,
    resendVerificationCodeResolvers,
    resetPasswordResolvers,
    verifyEmailResolvers,
    verifyResetPasswordRequestResolvers,
    hostResolvers,
]);
