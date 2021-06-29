export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    events: [
        {
            sqs: { arn: { "Fn::GetAtt": ["EmailQueue", "Arn"] } },
        },
    ],
};
