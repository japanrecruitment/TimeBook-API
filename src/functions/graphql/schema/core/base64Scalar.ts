import { gql } from "apollo-server-core";
import { GraphQLScalarType, Kind } from "graphql";

const Base64Scalar = new GraphQLScalarType({
    name: "Base64",
    description: "Base 64 value",
    serialize(value) {
        return Buffer.from(value).toString("base64");
    },
    parseValue(value) {
        if (typeof value !== "string") return value;
        return Buffer.from(value, "base64").toString();
    },
    parseLiteral(ast) {
        if (ast.kind !== Kind.STRING) return null;
        return Buffer.from(ast.value, "base64").toString();
    },
});

export const base64ScalarTypeDefs = gql`
    scalar Base64
`;

export const base64ScalarReolvers = {
    Base64: Base64Scalar,
};
