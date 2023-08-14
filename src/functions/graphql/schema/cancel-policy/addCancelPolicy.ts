import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { differenceWith, groupBy, isEmpty, isEqual, uniqWith } from "lodash";
import { GqlError } from "src/functions/graphql/error";
import { Context } from "../../context";
import { CancelPolicyObject, toCancelPolicySelect } from "./CancelPolicyObject";

function validateAddCancelPolicyInput(input: AddCancelPolicyInput): AddCancelPolicyInput {
    let { name, rates, description } = input;

    name = name.trim();
    description = description?.trim();
    rates = uniqWith(rates, isEqual);

    if (isEmpty(name)) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な名前" });

    rates.forEach(({ beforeHours, percentage }) => {
        if (beforeHours < 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "営業時間前は無効" });
        if (percentage < 0 || percentage > 100)
            throw new GqlError({ code: "BAD_USER_INPUT", message: "無効なパーセンテージ" });
    });

    differenceWith(
        rates,
        uniqWith(rates, (a, b) => a.beforeHours === b.beforeHours),
        isEqual
    ).forEach(({ beforeHours }) => {
        throw new GqlError({
            code: "BAD_USER_INPUT",
            message: `営業時間前{${beforeHours}}が同じである複数の料金が見つかりました`,
        });
    });

    return { name, rates, description };
}

type AddCancelPolicyRate = {
    beforeHours: number;
    percentage: number;
};

type AddCancelPolicyInput = {
    name: string;
    description?: string;
    rates: AddCancelPolicyRate[];
};

type AddCancelPolicyArgs = { spaceId?: string; hotelId?: string; input: AddCancelPolicyInput };

type AddCancelPolicyResult = {
    message: String;
    cancelPolicy?: CancelPolicyObject;
};

type AddCancelPolicy = IFieldResolver<any, Context, AddCancelPolicyArgs, Promise<AddCancelPolicyResult>>;

const addCancelPolicy: AddCancelPolicy = async (_, { spaceId, hotelId, input }, { authData, store }, info) => {
    const { accountId } = authData;

    const { name, rates, description } = validateAddCancelPolicyInput(input);
    if (spaceId) {
        const space = await store.space.findUnique({ where: { id: spaceId }, select: { accountId: true } });

        if (!space) throw new GqlError({ code: "NOT_FOUND", message: "スペースが見つかりません" });

        if (accountId !== space.accountId) throw new GqlError({ code: "UNAUTHORIZED", message: "無効なリクエスト" });
    }

    if (hotelId) {
        const hotel = await store.hotel.findUnique({ where: { id: hotelId }, select: { accountId: true } });

        if (!hotel) throw new GqlError({ code: "NOT_FOUND", message: "宿泊施設が見つかりません" });

        if (accountId !== hotel.accountId) throw new GqlError({ code: "UNAUTHORIZED", message: "無効なリクエスト" });
    }

    const cancelPolicySelect = toCancelPolicySelect(mapSelections(info)?.cancelPolicy)?.select;
    const cancelPolicy = await store.cancelPolicy.create({
        data: {
            name,
            description,
            rates: { createMany: { data: rates } },
            account: { connect: { id: accountId } },
            hotels: hotelId ? { connect: { id: hotelId } } : undefined,
            spaces: spaceId ? { connect: { id: spaceId } } : undefined,
        },
        select: cancelPolicySelect,
    });

    Log("addCancelPolicy", cancelPolicy);

    return { message: "キャンセルポリシーを追加しました", cancelPolicy };
};

export const addCancelPolicyTypeDefs = gql`
    input AddCancelPolicyRate {
        beforeHours: Float!
        percentage: Float!
    }

    input AddCancelPolicyInput {
        name: String!
        description: String
        rates: [AddCancelPolicyRate!]!
    }

    type AddCancelPolicyResult {
        message: String
        cancelPolicy: CancelPolicyObject
    }

    type Mutation {
        addCancelPolicy(input: AddCancelPolicyInput!): AddCancelPolicyResult @auth(requires: [host])
    }
`;

export const addCancelPolicyResolvers = { Mutation: { addCancelPolicy } };
