import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/index";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type SetupIntent = IFieldResolver<any, Context, any, Promise<string>>;

const setupIntent: SetupIntent = async (_, __, { authData, store }) => {
    const { accountId } = authData;

    // get current customer ID
    let account = await store.account.findUnique({
        where: { id: accountId },
        select: { id: true, paymentSource: true, email: true },
    });

    Log("addPaymentMethod account:", account);

    const stripe = new StripeLib();

    let customerId = null;
    if (account.paymentSource.length > 0) {
        // stripe customer already exists for that user
        customerId = account.paymentSource[0].customer;
    } else {
        // stripe customer does not exists so we will make one
        customerId = await stripe.createCustomer(accountId, account.email);
    }

    const intent = await stripe.setupPaymentIntent({
        payment_method_types: ["card"],
        customer: customerId,
    });

    Log("[FINISHED]: setting intent", intent);

    return intent.client_secret;
};

export const setupIntentTypedefs = gql`
    type Query {
        setupIntent: String @auth(requires: [user])
    }
`;

export const setupIntentResolvers = {
    Query: { setupIntent },
};
