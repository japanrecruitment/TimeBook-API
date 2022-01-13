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
        select: { id: true, email: true, userProfile: true },
    });

    const stripe = new StripeLib();

    let customerId: string = null;
    if (account.userProfile.stripeCustomerId !== "") {
        customerId = account.userProfile.stripeCustomerId;
    } else {
        customerId = await stripe.createCustomer(accountId, account.email);
        // store customerId to user
        await store.account.update({
            where: { id: account.id },
            data: { userProfile: { update: { stripeCustomerId: customerId } } },
        });
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
