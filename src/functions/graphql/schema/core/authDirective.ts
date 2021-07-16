import { SchemaDirectiveVisitor } from "@graphql-tools/utils";
import { gql } from "apollo-server-lambda";
import { defaultFieldResolver } from "graphql";
import { AuthenticatedUser, authStrategies } from "@libs/authorizer";
import { Log } from "@utils/logger";
import { GqlError } from "../../error";

class AuthDirective extends SchemaDirectiveVisitor {
    visitObject(object) {
        this.ensureFieldWrapped(object);
        object._requiredAuthRole = this.args.requires;
    }

    visitFieldDefinition(field, details) {
        this.ensureFieldWrapped(details.objectType);
        field._requiredAuthRole = this.args.requires;
    }

    private ensureFieldWrapped(objectType) {
        // Mark the GraphQLObjectType object to avoid re-wrapping.
        if (objectType._authFieldsWrapped) return;
        objectType._authFieldsWrapped = true;

        const fields = objectType.getFields();

        Object.keys(fields).forEach((fieldName) => {
            const field = fields[fieldName];
            const { resolve = defaultFieldResolver } = field;
            const executeStrategy = this.executeStrategy;
            field.resolve = async function (...args) {
                // Get the required Role from the field first, falling back
                // to the objectType if no Role is required by the field
                const requiredRoles = field._requiredAuthRole || objectType._requiredAuthRole;

                if (!requiredRoles) return resolve.apply(this, args);
                Log({ fieldName, requiredRole: requiredRoles });

                // Get the principal object of type AuthenticatedUser from
                // which we can get user's role to check whether the user
                // has the role required to access this field
                const principal: AuthenticatedUser = args[2]?.principal;
                if (principal?.roles?.length === 0)
                    throw new GqlError({ code: "UNAUTHORIZED", message: "Not authorized" });

                for (let role of requiredRoles) {
                    await executeStrategy(role, principal);
                }

                return await resolve.apply(this, args);
            };
        });
    }

    private async executeStrategy(role, requestData) {
        const strategyResult = await authStrategies[role.toLowerCase()](requestData);

        if (!strategyResult) throw new GqlError({ code: "UNAUTHORIZED", message: "Not authorized" });
    }
}

export const authDirectiveTypeDefs = gql`
    directive @auth(requires: [Role] = [user]) on OBJECT | FIELD_DEFINITION

    enum Role {
        user
        host
        admin
        unknown
    }
`;

export const authDirectives = {
    auth: AuthDirective,
};
