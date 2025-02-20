import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { isEmpty } from "lodash";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type RemovePaymentMethodArgs = { paymentMethodId: string };

type RemovePaymentMethodResult = Partial<Result>;

type RemovePaymentMethod = IFieldResolver<any, Context, RemovePaymentMethodArgs, Promise<RemovePaymentMethodResult>>;

const removePaymentMethod: RemovePaymentMethod = async (_, { paymentMethodId }, { authData, store }) => {
    const { accountId, id: userId } = authData;
    if (!accountId || !userId) throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });

    // get current customer ID
    const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });
    if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "ユーザーが見つかりません" });
    if (!user.stripeCustomerId)
        throw new GqlError({ code: "BAD_REQUEST", message: "ストライプアカウントが見つかりません" });

    Log("removePaymentMethod user:", user);

    const stripe = new StripeLib();
    const paymentMethod = await stripe.retrievePaymentMethod(paymentMethodId);
    await stripe.detachPaymentMethodToCustomer(paymentMethod.id);

    Log(paymentMethod);

    return { message: `支払い方法が削除されました` };
};

export const removePaymentMethodTypeDefs = gql`
    type Mutation {
        removePaymentMethod(paymentMethodId: String!): Result @auth(requires: [user])
    }
`;

export const removePaymentMethodResolvers = {
    Mutation: { removePaymentMethod },
};
