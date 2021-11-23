import { PaymentSource } from ".prisma/client";
import { IFieldResolver } from "@graphql-tools/utils";
import { S3Lib, StripeLib } from "@libs/index";
import { gql } from "apollo-server-core";
import { Context } from "../../../context";
import { Log } from "@utils/logger";
import Stripe from "stripe";
import { PaymentMethod } from "./paymentSource";

type AddPaymentMethodArgs = { paymentMethodId: string };

type TPaymentSource = IFieldResolver<any, Context, Record<string, any>, Promise<Partial<PaymentMethod>>>;

const addPaymentMethod: TPaymentSource = async (_, { paymentMethodId }, { authData, store }, info) => {
    const { accountId } = authData;

    // get current customer ID
    let account = await store.account.findUnique({
        where: { id: accountId },
        select: { id: true, paymentSource: true, email: true },
    });

    Log(account);

    const stripe = new StripeLib();

    let customerId = null;
    if (account.paymentSource.length > 0) {
        // stripe customer already exists for that user
        customerId = account.paymentSource[0].customer;
    } else {
        // stripe customer does not exists so we will make one
        customerId = await stripe.createCustomer(accountId, account.email);
    }

    const paymentMethod = await stripe.attachPaymentMethodToCustomer(customerId, paymentMethodId);

    Log(paymentMethod);

    const paymentMethodData = {
        customer: customerId,
        token: paymentMethod.id,
        type: "Card",
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
        last4: paymentMethod.card.last4,
        brand: paymentMethod.card.brand,
        country: paymentMethod.card.country,
        rawData: `${{ ...paymentMethod }}`,
    };

    await store.account.update({
        where: { id: accountId },
        data: {
            paymentSource: {
                create: {
                    customer: customerId,
                    token: paymentMethod.id,
                    type: "Card",
                    expMonth: paymentMethod.card.exp_month,
                    expYear: paymentMethod.card.exp_year,
                    last4: paymentMethod.card.last4,
                    brand: paymentMethod.card.brand,
                    country: paymentMethod.card.country,
                    rawData: `${{ ...paymentMethod }}`,
                },
            },
        },
    });
    return { id: paymentMethod.id, ...paymentMethodData };
};

export const addPaymentMethodTypeDefs = gql`
    type Mutation {
        addPaymentMethod(paymentMethodId: String!): PaymentSource @auth(requires: [user])
    }
`;

export const addPaymentMethodResolvers = {
    Mutation: { addPaymentMethod },
};
