import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../../context";
import { GqlError } from "../../../../error";
import { Result } from "../../../core/result";

type ApproveLicenseArgs = { id: string };

type ApproveLicenseResult = Promise<Result>;

type ApproveLicense = IFieldResolver<any, Context, ApproveLicenseArgs, ApproveLicenseResult>;

const approveLicense: ApproveLicense = async (_, { id }, { store }) => {
    const license = await store.license.update({ where: { id }, data: { approved: true } });

    if (!license) throw new GqlError({ code: "NOT_FOUND", message: "License doesn't exist" });

    return { message: `License approved` };
};

export const approveLicenseTypeDefs = gql`
    type Mutation {
        approveLicense(id: ID!): Result! @auth(requires: [admin])
    }
`;

export const approveLicenseResolvers = {
    Mutation: { approveLicense },
};
