import { IFieldResolver } from "@graphql-tools/utils";
import { CommissionType } from "@prisma/client";
import { gql } from "apollo-server-core";
import { GqlError } from "../../../error";
import { Context } from "../../../context";
import { Result } from "../../core/result";

type UpdateHostCommissionRateArgs = {
    hostId: string;
    commissionType: CommissionType;
    commissionRate?: number;
    commissionYen?: number;
};

type UpdateHostCommissionRateResult = Promise<Result>;

type UpdateHostCommissionRate = IFieldResolver<
    any,
    Context,
    UpdateHostCommissionRateArgs,
    UpdateHostCommissionRateResult
>;

const updateHostCommissionRate: UpdateHostCommissionRate = async (
    _,
    { hostId, commissionType, commissionRate, commissionYen },
    { store },
) => {
    if (commissionType === "Fixed") {
        if (!Number.isInteger(commissionYen) || commissionYen === undefined || commissionYen < 0)
            throw new GqlError({ code: "BAD_USER_INPUT", message: "手数料額は0以上の整数で入力してください。" });
    } else if (commissionType === "Percentage") {
        if (!Number.isInteger(commissionRate) || commissionRate === undefined || commissionRate < 0 || commissionRate > 100)
            throw new GqlError({ code: "BAD_USER_INPUT", message: "手数料率は0〜100の範囲で入力してください。" });
    } else {
        throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な手数料タイプです。" });
    }

    const host = await store.host.findUnique({ where: { id: hostId }, select: { id: true } });

    if (!host) throw new GqlError({ code: "NOT_FOUND", message: "ホストが見つかりませんでした。" });

    await store.host.update({
        where: { id: hostId },
        data:
            commissionType === "Fixed"
                ? { commissionType, commissionYen }
                : { commissionType, commissionRate },
    });

    return { message: `手数料が更新されました。` };
};

export const updateHostCommissionRateTypeDefs = gql`
    type Mutation {
        updateHostCommissionRate(
            hostId: ID!
            commissionType: CommissionType!
            commissionRate: Int
            commissionYen: Int
        ): Result @auth(requires: [admin])
    }
`;

export const updateHostCommissionRateResolvers = { Mutation: { updateHostCommissionRate } };

