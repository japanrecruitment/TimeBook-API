export const environment = {
    NODE_ENV: process.env.NODE_ENV,
    DB_URL: process.env.DB_URL,
    EMAIL_QUEUE_URL: process.env.EMAIL_QUEUE_URL,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    IP_STACK_KEY: process.env.IP_STACK_KEY,
    // S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    // S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    // BUCKET_URL: process.env.BUCKET_URL,
    S3_ACCESS_KEY: "AKIA267L7G76NKHOXLP2",
    S3_SECRET_KEY: "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",
    BUCKET_URL: "timebookdev",

    isDev() {
        return !this.NODE_ENV || !["production"].includes(this.NODE_ENV);
    },
};
