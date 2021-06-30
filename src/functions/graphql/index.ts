export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            http: {
                method: "post",
                path: "graphql",
                cors: true,
                authorizer: { name: "userAuthorizer", resultTtlInSeconds: 0 },
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
