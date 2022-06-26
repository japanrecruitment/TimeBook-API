import getSchema from "./get-schema";
import postSchema from "./post-schema";

export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            http: {
                method: "get",
                path: "photoObject",
                request: {
                    schemas: {
                        "application/json": getSchema,
                    },
                },
                cors: true,
            },
        },
        {
            http: {
                method: "post",
                path: "photoObject",
                request: {
                    schemas: {
                        "application/json": postSchema,
                    },
                },
                cors: true,
            },
        },
    ],
};
