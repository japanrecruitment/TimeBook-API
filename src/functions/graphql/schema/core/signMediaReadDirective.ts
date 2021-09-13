import { SchemaDirectiveVisitor } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { defaultFieldResolver } from "graphql";

class SignMediaReadDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field;
        field.resolve = async (...args) => {
            const result = await resolve.apply(this, args);

            Log(result);
            if (typeof result === "string") {
                return result.charAt(0).toUpperCase() + result.slice(1);
            }
            return result;
        };
    }
}

export const signMediaReadDirectiveTypeDefs = gql`
    directive @signMediaRead(ttl: Int = 600) on FIELD_DEFINITION
`;

export const signMediaReadDirective = {
    signMediaRead: SignMediaReadDirective,
};
