import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { merge } from "lodash";
import { forgotPasswordResolvers, forgotPasswordTypeDefs } from "./forgotPassword";
import { loginResolvers, loginTypeDefs } from "./login";
import { myProfileResolvers, myProfileTypeDefs } from "./myProfile";
import { profileResolvers, profileTypeDefs } from "./profile";
import { registerCompanyResolvers, registerCompanyTypeDefs } from "./registerCompany";
import { registerUserResolvers, registerUserTypeDefs } from "./registerUser";
import { resendVerificationCodeResolvers, resendVerificationCodeTypeDefs } from "./resendVerificationCode";
import { resetPasswordResolvers, resetPasswordTypeDefs } from "./resetPassword";
import { selfDirectives, selfDirectiveTypeDefs } from "./selfDirective";
import { verifyEmailResolvers, verifyEmailTypeDefs } from "./verifyEmail";
import { verifyResetPasswordRequestResolvers, verifyResetPasswordRequestTypeDefs } from "./verifyResetPasswordRequest";

export const accountTypeDefs = mergeTypeDefs([
    forgotPasswordTypeDefs,
    loginTypeDefs,
    profileTypeDefs,
    registerCompanyTypeDefs,
    registerUserTypeDefs,
    resendVerificationCodeTypeDefs,
    resetPasswordTypeDefs,
    verifyEmailTypeDefs,
    verifyResetPasswordRequestTypeDefs,
    myProfileTypeDefs,
    selfDirectiveTypeDefs,
]);

export const accountResolvers = mergeResolvers([
    forgotPasswordResolvers,
    loginResolvers,
    profileResolvers,
    registerCompanyResolvers,
    registerUserResolvers,
    resendVerificationCodeResolvers,
    resetPasswordResolvers,
    verifyEmailResolvers,
    verifyResetPasswordRequestResolvers,
    myProfileResolvers,
]);

export const accountDirectives = merge(selfDirectives);
