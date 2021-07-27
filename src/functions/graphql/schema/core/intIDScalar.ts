import { gql } from "apollo-server-core";
import { GraphQLScalarType, Kind } from "graphql";

const IntIDScalar = new GraphQLScalarType({
    name: "IntID",
    description: "Integer ID",
    serialize(value) {
        return value;
    },
    parseValue(value) {
        if (typeof value === "string") return parseInt(value, 10);
        return value;
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
            return ast.value;
        }
        if (ast.kind === Kind.STRING) {
            console.log(ast);

            return parseInt(ast.value, 10);
        }
        return null;
    },
});

export const intIDScalarTypeDefs = gql`
    scalar IntID
`;

export const intIDScalarResolvers = {
    IntID: IntIDScalar,
};
