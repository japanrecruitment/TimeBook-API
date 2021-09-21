import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { merge } from "lodash";
import { forgotPasswordResolvers, forgotPasswordTypeDefs } from "./forgotPassword";
import { loginResolvers, loginTypeDefs } from "./login";
import { myProfileResolvers, myProfileTypeDefs } from "./myProfile";
import { mySessionsResolvers, mySessionsTypeDefs } from "./mySessions";
import { profileResolvers, profileTypeDefs } from "./profile";
import { refreshTokenResolvers, refreshTokenTypeDefs } from "./refreshToken";
import { registerUserResolvers, registerUserTypeDefs } from "./registerUser";
import { resendVerificationCodeResolvers, resendVerificationCodeTypeDefs } from "./resendVerificationCode";
import { resetPasswordResolvers, resetPasswordTypeDefs } from "./resetPassword";
import { selfDirectives, selfDirectiveTypeDefs } from "./selfDirective";
import { updateMyProfileResolvers, updateMyProfileTypeDefs } from "./updateMyProfile";
import { verifyEmailResolvers, verifyEmailTypeDefs } from "./verifyEmail";
import { verifyResetPasswordRequestResolvers, verifyResetPasswordRequestTypeDefs } from "./verifyResetPasswordRequest";
import { hostResolvers, hostTypeDefs } from "./host";
import { registerHostResolvers, registerHostTypeDefs } from "./registerHost";
import { allAccountsResolvers, allAccountsTypeDefs } from "./allAccounts";

export const accountTypeDefs = mergeTypeDefs([
    allAccountsTypeDefs,
    forgotPasswordTypeDefs,
    loginTypeDefs,
    myProfileTypeDefs,
    mySessionsTypeDefs,
    profileTypeDefs,
    refreshTokenTypeDefs,
    registerHostTypeDefs,
    registerUserTypeDefs,
    resendVerificationCodeTypeDefs,
    resetPasswordTypeDefs,
    selfDirectiveTypeDefs,
    updateMyProfileTypeDefs,
    verifyEmailTypeDefs,
    verifyResetPasswordRequestTypeDefs,
    hostTypeDefs,
]);

export const accountResolvers = mergeResolvers([
    allAccountsResolvers,
    forgotPasswordResolvers,
    loginResolvers,
    myProfileResolvers,
    mySessionsResolvers,
    profileResolvers,
    refreshTokenResolvers,
    registerHostResolvers,
    registerUserResolvers,
    resendVerificationCodeResolvers,
    resetPasswordResolvers,
    updateMyProfileResolvers,
    verifyEmailResolvers,
    verifyResetPasswordRequestResolvers,
    hostResolvers,
]);

export const accountDirectives = merge(selfDirectives);
