export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            schedule: {
                rate: "cron(0 1 * * ? *)",
            },
        },
    ],
};
