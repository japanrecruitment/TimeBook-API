import { SchemaDirectiveVisitor } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { defaultFieldResolver } from "graphql";

class SelfDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field;
        field.resolve = async (...args) => {
            const { id, roles } = args[2].authData;
            const { id: sourceId } = args[0];

            if (sourceId !== id && !roles.includes["admin"]) return null;

            return await resolve.apply(this, args);
        };
    }
}

export const selfDirectiveTypeDefs = gql`
    directive @self on FIELD_DEFINITION
`;

export const selfDirectives = {
    self: SelfDirective,
};
