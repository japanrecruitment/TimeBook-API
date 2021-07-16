import type { AWS } from "@serverless/typescript";
import * as functions from "./src/functions";

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
            subnetIds: [{ Ref: "PrivateSubnet1" }, { Ref: "PrivateSubnet2" }, { Ref: "PrivateSubnet3" }],
            securityGroupIds: [{ Ref: "LambdaSecurityGroup" }],
        },
        environment: {
            NODE_ENV: "${opt:stage, 'dev'}",
            DB_URL: "${param:DB_URL}",
            TOKEN_SECRET: "${param:TOKEN_SECRET}",
            REFRESH_TOKEN_SECRET: "${param:REFRESH_TOKEN_SECRET}",
            STRIPE_PK: "${param:STRIPE_PK}",
            STRIPE_SK: "${param:STRIPE_SK}",
            EMAIL_QUEUE_URL: "${param:EMAIL_QUEUE_URL}",
            REDIS_HOST: "${param:REDIS_HOST}",
            REDIS_PORT: "${param:REDIS_PORT}",
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
    functions,
    resources,
};

module.exports = serverlessConfiguration;
