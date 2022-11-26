import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { forgotPasswordResolvers, forgotPasswordTypeDefs } from "./forgotPassword";
import { loginResolvers, loginTypeDefs } from "./login";
import { mySessionsResolvers, mySessionsTypeDefs } from "./mySessions";
import { profileResolvers, profileTypeDefs } from "./profile";
import { refreshTokenResolvers, refreshTokenTypeDefs } from "./refreshToken";
import { resendVerificationCodeResolvers, resendVerificationCodeTypeDefs } from "./resendVerificationCode";
import { resetPasswordResolvers, resetPasswordTypeDefs } from "./resetPassword";
import { verifyEmailResolvers, verifyEmailTypeDefs } from "./verifyEmail";
import { verifyResetPasswordRequestResolvers, verifyResetPasswordRequestTypeDefs } from "./verifyResetPasswordRequest";
import { hostResolvers, hostTypeDefs } from "./host";

export const accountTypeDefs = mergeTypeDefs([
    forgotPasswordTypeDefs,
    loginTypeDefs,
    mySessionsTypeDefs,
    profileTypeDefs,
    refreshTokenTypeDefs,
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
    resendVerificationCodeResolvers,
    resetPasswordResolvers,
    verifyEmailResolvers,
    verifyResetPasswordRequestResolvers,
    hostResolvers,
]);
