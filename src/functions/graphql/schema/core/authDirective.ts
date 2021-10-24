import { SchemaDirectiveVisitor } from "@graphql-tools/utils";
import { gql } from "apollo-server-lambda";
import { defaultFieldResolver } from "graphql";
import { authStrategies } from "@libs/authorizer";
import { Log } from "@utils/logger";
import { GqlError } from "../../error";
import { decodeToken } from "@utils/token-helper";

const allowedPath = ["login"];

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

const executeStrategy = async (requiredRoles, requestData, throwError = true): Promise<boolean> => {
    Log("Required roles", requiredRoles, "Current role", requestData?.roles);

    if (!requestData) {
        if (!throwError) return false;
        throw new GqlError({ code: "UNAUTHORIZED", message: "Not authorized" });
    }

    for (let role of requiredRoles) {
        const strategyResult = await authStrategies[role.toLowerCase()](requestData);
        if (strategyResult) return true;
    }

    if (!throwError) return false;

    throw new GqlError({ code: "UNAUTHORIZED", message: "Not authorized" });
};

const executeSelfStrategy = async (path, allowedRoles, account, authData): Promise<boolean> => {
    if (allowedPath.map((p) => p.toLocaleLowerCase()).includes(path.toLowerCase())) return true;
    if (account?.accountId === authData?.accountId) return true;
    return await executeStrategy(allowedRoles, authData, false);
};

class AuthDirective extends SchemaDirectiveVisitor {
    visitObject(object) {
        this.ensureFieldWrapped(object);
        object._requiredAuthRole = this.args.requires;
    }

    visitFieldDefinition(field, details) {
        this.ensureFieldWrapped(details.objectType);
        field._requiredAuthRole = this.args.requires;
        field._allowSelf = this.args.allowSelf;
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
                const path = args[3]?.operation?.name?.value;
                Log({ path });

                const allowSelf = field._allowSelf;

                // Get the required Role from the field first, falling back
                // to the objectType if no Role is required by the field
                const requiredRoles = field._requiredAuthRole || objectType._requiredAuthRole;

                if (!requiredRoles) return resolve.apply(this, args);
                Log({ fieldName });

                const authData = await getAuthData(args[2]?.event);

                if (allowSelf) {
                    const result = await executeSelfStrategy(path, requiredRoles, args[0], authData);
                    Log("checkself", result);
                    if (!result) return null;
                } else {
                    await executeStrategy(requiredRoles, authData);
                }

                console.log(args[0]);

                // Assign the value of authData in the context
                const argsWithAuthData = args.map((arg, index) => (index === 2 ? { ...arg, authData } : arg));
                return await resolve.apply(this, argsWithAuthData);
            };
        });
    }
}

export const authDirectiveTypeDefs = gql`
    directive @auth(requires: [Role] = [unknown], allowSelf: Boolean = false) on OBJECT | FIELD_DEFINITION

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
