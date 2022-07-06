export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            http: {
                method: "get",
                path: "photoObject",
                cors: true,
            },
        },
        {
            http: {
                method: "post",
                path: "photoObject",
                cors: true,
            },
        },
    ],
};
