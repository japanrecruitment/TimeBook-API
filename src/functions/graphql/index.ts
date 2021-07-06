export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            http: {
                method: "post",
                path: "graphql",
                cors: true,
                authorizer: { name: "userAuthorizer", resultTtlInSeconds: 0 },
                response: {
                    statusCodes: {
                        403: {
                            pattern: '.*"statusCode":403,.*', // JSON Response
                            template: {
                                "application/json": '$input.path("$.errorMessage")',
                            },
                        },
                    },
                },
            },
        },
        {
            http: {
                method: "get",
                path: "graphql",
                cors: true,
                authorizer: { name: "userAuthorizer", resultTtlInSeconds: 0 },
            },
        },
    ],
};
