import type { AWS } from "@serverless/typescript";
import * as functions from "./src/functions";

import resources from "./cloudformation-template";

const serverlessConfiguration: AWS = {
    service: "pocketseq-api",
    frameworkVersion: "3",
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
                statements: [
                    { Effect: "Allow", Action: ["sqs:SendMessage"], Resource: { "Fn::GetAtt": ["EmailQueue", "Arn"] } },
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
            STRIPE_WEBHOOK_SECRET: "${env:STRIPE_WEBHOOK_SECRET}",
            REDIS_HOST: { "Fn::GetAtt": ["ElastiCacheCluster", "RedisEndpoint.Address"] },
            REDIS_PORT: { "Fn::GetAtt": ["ElastiCacheCluster", "RedisEndpoint.Port"] },
            IP_STACK_KEY: "${env:IP_STACK_KEY}",
            EMAIL_QUEUE_URL: { Ref: "EmailQueue" },
            // TRANSACTION_QUEUE: { Ref: "TransactionQueue" },
            MEDIA_BUCKET: "${self:custom.mediaBucket}",
            MEDIA_UPLOAD_BUCKET: "${self:custom.uploadMediaBucket}",
            PUBLIC_MEDIA_BUCKET: "${self:custom.publicMediaBucket}",
            ALGOLIA_APP_ID: "${env:ALGOLIA_APP_ID}",
            ALGOLIA_ADMIN_API_KEY: "${env:ALGOLIA_ADMIN_API_KEY}",
            ALGOLIA_SEARCH_API_KEY: "${env:ALGOLIA_SEARCH_API_KEY}",
            FRONTEND_BASE_URL: "${env:FRONTEND_BASE_URL}",
            GOOGLE_MAP_API_KEY: "${env:GOOGLE_MAP_API_KEY}",
        },
        apiGateway: {
            shouldStartNameWithService: true,
        },
    },
    custom: {
        webpack: {
            webpackConfig: "./webpack.config.js",
            includeModules: true,
            packagerOptions: {
                scripts: ["prisma generate"],
            },
        },
        enterprise: {
            collectLambdaLogs: false,
        },
        mediaBucket: "timebook-api-${sls:stage}-media",
        uploadMediaBucket: "timebook-api-${sls:stage}-media-upload",
        publicMediaBucket: "timebook-public-media",
    },
    plugins: ["serverless-webpack", "serverless-webpack-prisma", "serverless-offline"],
    package: {
        patterns: [
            "!node_modules/.prisma/client/libquery_engine-*",
            "node_modules/.prisma/client/libquery_engine-rhel-*",
            "!node_modules/prisma/libquery_engine-*",
            "!node_modules/@prisma/engines/**",
        ],
        individually: true,
    },
    variablesResolutionMode: "20210219",
    functions,
    resources,
};

module.exports = serverlessConfiguration;