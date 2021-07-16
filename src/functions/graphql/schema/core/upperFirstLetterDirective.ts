import { SchemaDirectiveVisitor } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { defaultFieldResolver } from "graphql";

class UpperFirstLetterDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field;
        field.resolve = async (...args) => {
            const result = await resolve.apply(this, args);
            if (typeof result === "string") {
                return result.charAt(0).toUpperCase() + result.slice(1);
            }
            return result;
        };
    }
}

export const upperFirstLetterDirectiveTypeDefs = gql`
    directive @upperFirstLetter on FIELD_DEFINITION
`;

export const upperFirstLetterDirective = {
    upperFirstLetter: UpperFirstLetterDirective,
};
