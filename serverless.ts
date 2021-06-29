import type { AWS } from "@serverless/typescript";
import {
    graphql,
    login,
    adminAuthorizer,
    userAuthorizer,
    emailWorker,
} from "./src/functions";

import resources from "./cloudformation-template";

const serverlessConfiguration: AWS & { app?: string; org?: string } = {
    app: "timebook",
    org: "japanrecruitment",
    service: "timebook-api",
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
            role: {
                managedPolicies: [
                    "arn:aws:iam::aws:policy/AmazonS3FullAccess",
                    "arn:aws:iam::aws:policy/AmazonSESFullAccess",
                    "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole",
                ],
            },
        },
        vpc: {
            subnetIds: [
                { Ref: "PrivateSubnet1" },
                { Ref: "PrivateSubnet2" },
                { Ref: "PrivateSubnet3" },
            ],
            securityGroupIds: [{ Ref: "LambdaSecurityGroup" }],
        },
        environment: {
            NODE_ENV: "${opt:stage, 'dev'}",
            DB_URL: "${param:DB_URL}",
            TOKEN_SECRET: "${param:TOKEN_SECRET}",
            EMAIL_QUEUE_URL: { Ref: "EmailQueue" },
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
        emailWorker,
    },
    resources,
};

module.exports = serverlessConfiguration;
