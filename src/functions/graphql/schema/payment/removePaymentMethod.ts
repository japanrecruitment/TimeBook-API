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
    if (!accountId || !userId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    // get current customer ID
    const account = await store.account.findUnique({
        where: { id: accountId },
        select: {
            paymentSource: { where: { token: paymentMethodId }, select: { id: true } },
            userProfile: { select: { stripeCustomerId: true } },
        },
    });
    if (!account || !account.userProfile) throw new GqlError({ code: "BAD_REQUEST", message: "Account not found" });
    if (!account.userProfile.stripeCustomerId) {
        throw new GqlError({ code: "BAD_REQUEST", message: "Stripe account not found" });
    }
    if (isEmpty(account.paymentSource)) {
        throw new GqlError({ code: "BAD_REQUEST", message: "Payment source not found" });
    }

    if (account.paymentSource.length > 1) {
        throw new GqlError({
            code: "FORBIDDEN",
            message: "Multiple payment source with same token found. Please contact our support team",
        });
    }

    Log("removePaymentMethod account:", account);

    const stripe = new StripeLib();
    const paymentMethod = await stripe.detachPaymentMethodToCustomer(paymentMethodId);

    Log(paymentMethod);

    await store.paymentSource.delete({ where: { id: account.paymentSource[0].id } });

    return { message: `Payment method removed.` };
};

export const removePaymentMethodTypeDefs = gql`
    type Mutation {
        removePaymentMethod(paymentMethodId: String!): Result @auth(requires: [user])
    }
`;

export const removePaymentMethodResolvers = {
    Mutation: { removePaymentMethod },
};
