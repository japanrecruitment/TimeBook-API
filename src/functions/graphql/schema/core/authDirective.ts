import { SchemaDirectiveVisitor } from "@graphql-tools/utils";
import { gql } from "apollo-server-lambda";
import { defaultFieldResolver } from "graphql";
import { authStrategies } from "@libs/authorizer";
import { Log } from "@utils/logger";
import { GqlError } from "../../error";
import { decodeToken } from "@utils/token-helper";

const getAuthData = async (event) => {
    try {
        const token = event.headers.Authorization || event.headers.authorization;
        return decodeToken(token, "access") || { roles: ["unknown"] };
    } catch (error) {
        const code = "FORBIDDEN";
        const message = error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
        const action = error.name === "TokenExpiredError" ? "refresh-token" : "logout";

        console.log({ code, message, action });
        throw new GqlError({ code, message, action });
    }
};

const executeStrategy = async (requiredRoles, requestData) => {
    Log("Required roles", requiredRoles, "Current role", requestData.roles);

    for (let role of requiredRoles) {
        const strategyResult = await authStrategies[role.toLowerCase()](requestData);
        if (strategyResult) return;
    }

    throw new GqlError({ code: "UNAUTHORIZED", message: "Not authorized" });
};

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
            field.resolve = async function (...args) {
                // Get the required Role from the field first, falling back
                // to the objectType if no Role is required by the field
                const requiredRoles = field._requiredAuthRole || objectType._requiredAuthRole;

                if (!requiredRoles) return resolve.apply(this, args);
                Log({ fieldName });

                const authData = await getAuthData(args[2]?.event);
                if (authData?.roles?.length === 0)
                    throw new GqlError({ code: "UNAUTHORIZED", message: "Not authorized" });

                await executeStrategy(requiredRoles, authData);

                // Assign the value of authData in the context
                const argsWithAuthData = args.map((arg, index) => (index === 2 ? { ...arg, authData } : arg));
                return await resolve.apply(this, argsWithAuthData);
            };
        });
    }
}

export const authDirectiveTypeDefs = gql`
    directive @auth(requires: [Role] = [unknown]) on OBJECT | FIELD_DEFINITION

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
