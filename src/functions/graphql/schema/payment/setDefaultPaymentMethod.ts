import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { Result } from "../core/result";

type SetDefaultPaymentMethodArgs = { paymentMethodId: string };

type SetDefaultPaymentMethodResult = Promise<Result>;

type SetDefaultPaymentMethod = IFieldResolver<any, Context, SetDefaultPaymentMethodArgs, SetDefaultPaymentMethodResult>;

const setDefaultPaymentMethod: SetDefaultPaymentMethod = async (_, { paymentMethodId }, { authData, store }) => {
    const { accountId, email, id: userId } = authData;
    if (!accountId || !email || !userId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const user = await store.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } });

    if (!user) throw new GqlError({ code: "BAD_REQUEST", message: "User not found" });

    if (!user.stripeCustomerId) throw new GqlError({ code: "BAD_REQUEST", message: "Stripe account not found" });

    const stripe = new StripeLib();

    await stripe.setDefaultPaymentSource(user.stripeCustomerId, paymentMethodId);

    return {
        message: "Changed default payment method",
    };
};

export const setDefaultPaymentMethodTypeDefs = gql`
    type Mutation {
        setDefaultPaymentMethod(paymentMethodId: ID): Result @auth(requires: [user, host])
    }
`;

export const setDefaultPaymentMethodResolvers = { Mutation: { setDefaultPaymentMethod } };
