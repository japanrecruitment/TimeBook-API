import { UserRole } from "./UserRole";

export class AuthenticatedUser<TData = any> {
    private authorizer;
    constructor(event) {
        this.authorizer = event.requestContext.authorizer;
    }
    get id(): string {
        return this.authorizer?.principalId || this.authorizer?.claims?.id;
    }
    get roles(): UserRole[] {
        return this.authorizer?.claims?.roles;
    }
    get accountId(): string {
        return this.authorizer?.claims?.accountId;
    }
    get data(): TData {
        return this.authorizer?.claims;
    }
}
