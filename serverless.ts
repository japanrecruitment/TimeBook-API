import type { AWS } from "@serverless/typescript";
import * as functions from "./src/functions";

import resources from "./cloudformation-template";

const serverlessConfiguration: AWS = {
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
            DB_URL: "${env:DB_URL}",
            TOKEN_SECRET: "${env:TOKEN_SECRET}",
            REFRESH_TOKEN_SECRET: "${env:REFRESH_TOKEN_SECRET}",
            STRIPE_PK: "${env:STRIPE_PK}",
            STRIPE_SK: "${env:STRIPE_SK}",
            STRIPE_CONNECT_CLIENT_ID: "${env:STRIPE_CONNECT_CLIENT_ID}",
            STRIPE_CONNECT_ACCOUNT_RETURN_URL: "${env:STRIPE_CONNECT_ACCOUNT_RETURN_URL}",
            STRIPE_CONNECT_ACCOUNT_REFRESH_URL: "${env:STRIPE_CONNECT_ACCOUNT_REFRESH_URL}",
            REDIS_HOST: { "Fn::GetAtt": ["ElastiCacheCluster", "RedisEndpoint.Address"] },
            REDIS_PORT: { "Fn::GetAtt": ["ElastiCacheCluster", "RedisEndpoint.Port"] },
            IP_STACK_KEY: "${env:IP_STACK_KEY}",
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
        enterprise: {
            collectLambdaLogs: false,
        },
    },
    plugins: ["serverless-webpack", "serverless-offline"],
    variablesResolutionMode: "20210219",
    functions,
    resources,
};

module.exports = serverlessConfiguration;
