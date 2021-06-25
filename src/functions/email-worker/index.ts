export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            sqs: "${param:EMAIL_QUEUE_ARN}",
        },
    ],
};
