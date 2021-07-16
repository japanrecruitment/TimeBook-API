import { SchemaDirectiveVisitor } from "@graphql-tools/utils";
import { defaultFieldResolver } from "graphql";

class SelfDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition(field) {
        const { resolve = defaultFieldResolver } = field;
        field.resolve = async (...args) => {
            // get context from arguments array
            const context = args[2];
            // get selected resource
            // note resource is mongoose response object and not regular object
            const resource = args[0];

            const { principal } = context;
            const { id: resourceId } = resource;

            // if resource owner is not 'admin' && not self then return null
            if (principal.role !== "admin" && principal.id.toString() !== resourceId.toString()) {
                return null;
            }
            const result = await resolve.apply(this, args);
            return result;
        };
    }
}
