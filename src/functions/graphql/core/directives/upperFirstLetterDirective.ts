import { SchemaDirectiveVisitor } from "apollo-server-lambda";
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

export default UpperFirstLetterDirective;
