export default {
    handler: `${__dirname.split(process.cwd())[1].substring(1)}/handler.main`,
    memorySize: 128,
    description: "Admin Token Authorizer",
};
