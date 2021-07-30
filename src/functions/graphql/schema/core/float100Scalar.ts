import { gql } from "apollo-server-core";
import { GraphQLScalarType, Kind } from "graphql";
import { GqlError } from "../../error";

const Float100Scalar = new GraphQLScalarType({
    name: "Float100",
    description: "Floating point number",
    serialize(value) {
        return value / 100;
    },
    parseValue(value) {
        if (typeof value === "number") return value * 100;
        throw new GqlError({
            code: "BAD_REQUEST",
            message: `Invalid value type. Required FloatNum found ${typeof value}`,
        });
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.FLOAT || ast.kind === Kind.INT) {
            return parseFloat(ast.value) * 100;
        }
        return null;
    },
});

export const float100ScalarTypeDefs = gql`
    scalar Float100

    type Query {
        checkFloat100(num: Float100): Float100
    }
`;

export const float100ScalarResolvers = {
    Float100: Float100Scalar,
    Query: {
        checkFloat100: (_, { num }) => {
            console.log(num);
            return num;
        },
    },
};
