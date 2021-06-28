import type { AWS } from "@serverless/typescript";
import {
    graphql,
    login,
    adminAuthorizer,
    userAuthorizer,
} from "./src/functions";
// emailWorker,

const serverlessConfiguration: AWS & { app?: string; org?: string } = {
    app: "timebook",
    org: "japanrecruitment",
    service: "api",
    frameworkVersion: "2",
    useDotenv: true,
    provider: {
        name: "aws",
        runtime: "nodejs14.x",
        lambdaHashingVersion: "20201221",
        region: "ap-northeast-1",
        memorySize: 512,
        timeout: 20,
        iam: {
            role: "arn:aws:iam::753724766204:role/JRG-Lambda-Execution-Role",
        },
        vpc: {
            subnetIds: [
                "subnet-0ceadf3708dbbe3b7",
                "subnet-0d464c5ca21b15b59",
                "subnet-02fb4bcb589ba9bc1",
            ],
            securityGroupIds: ["sg-04e8b0f7f14489ba3"],
        },
        environment: {
            NODE_ENV: "${opt:stage, 'dev'}",
            DB_URL: "${param:DB_URL}",
            TOKEN_SECRET: "${param:TOKEN_SECRET}",
            // STRIPE_SKEY: "${param:STRIPE_SKEY}",
            // STRIPE_WH_KEY: "${param:STRIPE_WH_KEY}",
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
    },
    plugins: ["serverless-webpack", "serverless-offline"],
    variablesResolutionMode: "20210219",
    functions: {
        adminAuthorizer,
        userAuthorizer,
        graphql,
        login,
        // emailWorker,
    },
};

module.exports = serverlessConfiguration;
