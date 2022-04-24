export const environment = {
    APP_NAME: "timebook-api",
    APP_READABLE_NAME: "PocketseQ",
    NODE_ENV: process.env.NODE_ENV,
    DB_URL: process.env.DB_URL,
    EMAIL_QUEUE_URL: process.env.EMAIL_QUEUE_URL,
    TRANSACTION_QUEUE: process.env.TRANSACTION_QUEUE,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    IP_STACK_KEY: process.env.IP_STACK_KEY,
    FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL,
    MEDIA_BUCKET: process.env.MEDIA_BUCKET,
    MEDIA_UPLOAD_BUCKET: process.env.MEDIA_UPLOAD_BUCKET,
    PUBLIC_MEDIA_BUCKET: process.env.PUBLIC_MEDIA_BUCKET,
    STRIPE_CONNECT_CLIENT_ID: process.env.STRIPE_CONNECT_CLIENT_ID,
    STRIPE_CONNECT_ACCOUNT_RETURN_URL:
        process.env.STRIPE_CONNECT_ACCOUNT_RETURN_URL || "http://localhost:3001/return-url",
    STRIPE_CONNECT_ACCOUNT_REFRESH_URL:
        process.env.STRIPE_CONNECT_ACCOUNT_REFRESH_URL || "http://localhost:3001/refresh-url",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
    ALGOLIA_ADMIN_API_KEY: process.env.ALGOLIA_ADMIN_API_KEY,
    ALGOLIA_SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY,
    isDev() {
        return !this.NODE_ENV || !["production"].includes(this.NODE_ENV);
    },
    BUCKET_URL: process.env.BUCKET_URL,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY,
};
