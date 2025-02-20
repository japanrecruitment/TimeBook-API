import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../../../context";
import { GqlError } from "../../../../error";
import { Result } from "../../../core/result";

type ApproveLicenseArgs = { id: string; remarks: string };

type ApproveLicenseResult = Promise<Result>;

type ApproveLicense = IFieldResolver<any, Context, ApproveLicenseArgs, ApproveLicenseResult>;

const rejectLicense: ApproveLicense = async (_, { id, remarks }, { store }) => {
    const license = await store.license.update({ where: { id }, data: { approved: false, remarks } });

    if (!license) throw new GqlError({ code: "NOT_FOUND", message: "ライセンスが見つかりませんでした。" });

    return { message: `ライセンスが拒否されました。` };
};

export const rejectLicenseTypeDefs = gql`
    type Mutation {
        rejectLicense(id: ID!, remarks: String): Result! @auth(requires: [admin])
    }
`;

export const rejectLicenseResolvers = {
    Mutation: { rejectLicense },
};
