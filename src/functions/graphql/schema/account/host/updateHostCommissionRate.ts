import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type UpdateHostCommissionRateArgs = { hostId: string; commissionRate: number };

type UpdateHostCommissionRateResult = Promise<Result>;

type UpdateHostCommissionRate = IFieldResolver<
    any,
    Context,
    UpdateHostCommissionRateArgs,
    UpdateHostCommissionRateResult
>;

const updateHostCommissionRate: UpdateHostCommissionRate = async (_, { hostId, commissionRate }, { store }) => {
    if (!Number.isInteger(commissionRate) || commissionRate < 0 || commissionRate > 100)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "手数料率は0〜100の範囲で入力してください。" });

    const host = await store.host.findUnique({ where: { id: hostId }, select: { id: true } });

    if (!host) throw new GqlError({ code: "NOT_FOUND", message: "ホストが見つかりませんでした。" });

    await store.host.update({ where: { id: hostId }, data: { commissionRate } });

    return { message: `手数料率が更新されました。` };
};

export const updateHostCommissionRateTypeDefs = gql`
    type Mutation {
        updateHostCommissionRate(hostId: ID!, commissionRate: Int!): Result @auth(requires: [admin])
    }
`;

export const updateHostCommissionRateResolvers = { Mutation: { updateHostCommissionRate } };
