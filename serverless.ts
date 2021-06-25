import type { AWS } from "@serverless/typescript";
import {
    graphql,
    login,
    register,
    resendCode,
    verifyEmail,
    forgotPassword,
    resetPassword,
    verifyPasswordReset,
    emailWorker,
    adminAuthorizer,
    userAuthorizer,
    payment,
    webhook,
} from "./src/functions";

const serverlessConfiguration: AWS & { app?: string; org?: string } = {
    app: "elearning",
    org: "japanrecruitment",
    service: "learn",
    frameworkVersion: "2",
    provider: {
        name: "aws",
        runtime: "nodejs12.x",
        lambdaHashingVersion: "20201221",
        region: "ap-northeast-1",
        memorySize: 512,
        timeout: 20,
        iam: { role: "arn:aws:iam::753724766204:role/JRG-Lambda-Execution-Role" },
        vpc: {
            subnetIds: ["subnet-0ceadf3708dbbe3b7", "subnet-0d464c5ca21b15b59", "subnet-02fb4bcb589ba9bc1"],
            securityGroupIds: ["sg-04e8b0f7f14489ba3"],
        },
        environment: {
            NODE_ENV: "${opt:stage, 'dev'}",
            DB_URL: "${param:DB_URL}",
            EMAIL_QUEUE: "${param:EMAIL_QUEUE}",
            CF_STREAM_ACCOUNT_ID: "${param:CF_STREAM_ACCOUNT_ID}",
            CF_STREAM_TOKEN: "${param:CF_STREAM_TOKEN}",
            TOKEN_SECRET: "${param:TOKEN_SECRET}",
            STRIPE_SKEY: "${param:STRIPE_SKEY}",
            STRIPE_WH_KEY: "${param:STRIPE_WH_KEY}",
            IP_STACK_KEY: "${param:IP_STACK_KEY}",
            KOMOJU_SKEY: "${param:KOMOJU_SKEY}",
            KOMOJU_WH_KEY: "${param:KOMOJU_WH_KEY}",
        },
        apiGateway: {
            shouldStartNameWithService: true,
        },
    },
    custom: {
        webpack: {
            webpackConfig: "./webpack.config.js",
            includeModules: true,
        },
        customDomain: {
            domainName: "learn.japanrecruitment.co.jp",
            basePath: "${param:STAGE}",
            stage: "${param:STAGE}",
            createRoute53Record: true,
        },
    },
    plugins: ["serverless-webpack", "serverless-offline", "serverless-domain-manager"],
    variablesResolutionMode: "20210219",
    functions: {
        adminAuthorizer,
        userAuthorizer,
        graphql,
        login,
        register,
        resendCode,
        verifyEmail,
        forgotPassword,
        resetPassword,
        verifyPasswordReset,
        emailWorker,
        payment,
        webhook,
    },
};

module.exports = serverlessConfiguration;
