export const environment = {
    NODE_ENV: process.env.NODE_ENV,
    DB_URL: process.env.DB_URL,
    EMAIL_QUEUE: process.env.EMAIL_QUEUE,
    TOKEN_SECRET: process.env.TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    isDev() {
        return !this.NODE_ENV || !["production"].includes(this.NODE_ENV);
    },
};
