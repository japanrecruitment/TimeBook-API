import { AuthTokenPayload } from "./AuthTokenHandler";
import { UserRole } from "./UserRole";

export class AuthenticatedUser {
    private authorizer;
    constructor(event) {
        this.authorizer = event.requestContext.authorizer;
    }
    get id(): string {
        return this.authorizer?.principalId;
    }
    get role(): UserRole {
        return this.authorizer?.claims?.role;
    }
    get claims(): AuthTokenPayload {
        return this.authorizer?.claims;
    }
}
