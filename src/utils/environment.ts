export const environment = {
    NODE_ENV: process.env.NODE_ENV,
    DB_URL: process.env.DB_URL,
    EMAIL_QUEUE_URL: process.env.EMAIL_QUEUE_URL,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    IP_STACK_KEY: process.env.IP_STACK_KEY,
    isDev() {
        return !this.NODE_ENV || !["production"].includes(this.NODE_ENV);
    },
};
