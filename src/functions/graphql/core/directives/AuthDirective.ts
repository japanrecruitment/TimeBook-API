import { AuthenticatedUser, authStrategies } from "@libs/authorizer";
import { ApolloError } from "apollo-server-lambda";
import { defaultFieldResolver } from "graphql";
import { SchemaDirectiveVisitor } from "graphql-tools";

export default class AuthDirective extends SchemaDirectiveVisitor {
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
                const requiredRole = field._requiredAuthRole || objectType._requiredAuthRole;

                if (!requiredRole) return resolve.apply(this, args);
                console.log(fieldName, requiredRole);

                // Get the principal object of type AuthenticatedUser from
                // which we can get user's role to check whether the user
                // has the role required to access this field
                const principal: AuthenticatedUser = args[2]?.principal;

                if (!principal?.role) throw new ApolloError("Not authorized");
                await executeStrategy(requiredRole, principal);

                return await resolve.apply(this, args);
            };
        });
    }

    private async executeStrategy(role, requestData) {
        const strategyResult = await authStrategies[role.toLowerCase()](requestData);

        console.log(strategyResult);
        if (!strategyResult) throw new ApolloError("Not authorized");
    }
}
