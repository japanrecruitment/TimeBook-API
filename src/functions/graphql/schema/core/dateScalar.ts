import { convertToJST } from "@utils/date-utils";
import { gql } from "apollo-server-core";
import { GraphQLScalarType, Kind } from "graphql";

const DateScalar = new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    serialize(value) {
        return convertToJST(value).getTime(); // Convert outgoing Date to integer for JSON
    },
    parseValue(value) {
        return new Date(value); // Convert incoming integer to Date
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST string to integer and then to Date
        }
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value); // Convert hard-coded AST string to integer and then to Date
        }
        return null; // Invalid hard-coded value (not an integer)
    },
});

export const dateScalarTypeDefs = gql`
    scalar Date
`;

export const dateScalarResolvers = {
    Date: DateScalar,
};
