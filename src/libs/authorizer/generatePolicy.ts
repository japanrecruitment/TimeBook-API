type PrincipalId = string | null;

type PolicyEffect = "Allow" | "Deny";

export type ExecutionPolicy = {
    principalId: PrincipalId;
    policyDocument: any;
    context: any;
};

export type PolicyGenerator = (
    principalId: PrincipalId,
    effect: PolicyEffect,
    resource: any,
    data: any
) => ExecutionPolicy;

export const generatePolicy: PolicyGenerator = (principalId, effect, resource, data) => {
    const statementOne = { Action: "execute-api:Invoke", Effect: effect, Resource: resource };
    const policyDocument = { Version: "2012-10-17", Statement: [statementOne] };
    const context = data || {};
    return { principalId, policyDocument, context };
};
