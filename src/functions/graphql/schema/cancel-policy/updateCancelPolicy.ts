import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { differenceWith, isEmpty, uniqWith } from "lodash";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../context";
import { CancelPolicyObject, toCancelPolicySelect } from "./CancelPolicyObject";

function validateUpdateCancelPolicyInput(input: UpdateCancelPolicyInput): UpdateCancelPolicyInput {
    let { id, name, description, rates } = input;

    id = id?.trim();
    name = name?.trim();
    description = description?.trim();

    if (isEmpty(id)) throw new GqlError({ code: "BAD_REQUEST", message: "キャンセルポリシーIDを入力してください" });

    if (name && isEmpty(name)) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な名前" });

    if (!isEmpty(rates)) {
        rates.forEach(({ beforeHours, percentage }) => {
            if (beforeHours < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "営業時間前は無効" });
            if (percentage < 0 || percentage > 100)
                throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なパーセンテージ" });
        });

        differenceWith(
            rates,
            uniqWith(rates, (a, b) => a.beforeHours === b.beforeHours),
            (a, b) => a.beforeHours === b.beforeHours
        ).forEach(({ beforeHours }) => {
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: `営業時間前 (${beforeHours}) が同じである複数の料金が見つかりました`,
            });
        });
    }

    return { id, name, description, rates };
}

type UpdateCancelPolicyRate = {
    beforeHours: number;
    percentage: number;
};

type UpdateCancelPolicyInput = {
    id: string;
    name: string;
    description?: string;
    rates: UpdateCancelPolicyRate[];
};

type UpdateCancelPolicyArgs = { input: UpdateCancelPolicyInput };

type UpdateCancelPolicyResult = {
    message: String;
    cancelPolicy?: CancelPolicyObject;
};

type UpdateCancelPolicy = IFieldResolver<any, Context, UpdateCancelPolicyArgs, Promise<UpdateCancelPolicyResult>>;

const updateCancelPolicy: UpdateCancelPolicy = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData;

    const { id, name, rates, description } = validateUpdateCancelPolicyInput(input);

    const cancelPolicy = await store.cancelPolicy.findUnique({
        where: { id },
        select: { accountId: true },
    });

    if (!cancelPolicy) throw new GqlError({ code: "NOT_FOUND", message: "キャンセルポリシーが見つかりません" });

    if (accountId !== cancelPolicy.accountId) throw new GqlError({ code: "UNAUTHORIZED", message: "無効なリクエスト" });

    const cancelPolicySelect = toCancelPolicySelect(mapSelections(info)?.cancelPolicy)?.select;
    const updatedCancelPolicy = await store.cancelPolicy.update({
        where: { id },
        data: {
            name,
            description,
            rates: !isEmpty(rates) ? { deleteMany: { cancelPolicyId: id }, createMany: { data: rates } } : undefined,
        },
        select: cancelPolicySelect,
    });

    Log("updateCancelPolicy", updatedCancelPolicy);

    return {
        message: `キャンセルポリシーを更新しました`,
        cancelPolicy: updatedCancelPolicy,
    };
};

export const updateCancelPolicyTypeDefs = gql`
    input UpdateCancelPolicyRate {
        beforeHours: Float!
        percentage: Float!
    }

    input UpdateCancelPolicyInput {
        id: ID!
        name: String
        description: String
        rates: [AddCancelPolicyRate]
    }

    type UpdateCancelPolicyResult {
        message: String
        cancelPolicy: CancelPolicyObject
    }

    type Mutation {
        updateCancelPolicy(input: UpdateCancelPolicyInput!): UpdateCancelPolicyResult @auth(requires: [host])
    }
`;

export const updateCancelPolicyResolvers = { Mutation: { updateCancelPolicy } };
