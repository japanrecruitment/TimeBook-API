import Stripe from "stripe";
import { environment, Log } from "@utils/index";

const returnURL = environment.STRIPE_CONNECT_ACCOUNT_RETURN_URL;
const refreshURL = environment.STRIPE_CONNECT_ACCOUNT_REFRESH_URL;

const stripe = new Stripe(process.env.STRIPE_SK, {
    apiVersion: "2020-08-27",
});

interface CreateConnectAccountInput {
    email: string;
}

interface IStripeUtil {
    createConnectAccount: (CreateConnectAccountInput) => Promise<Stripe.Account>;
    createAccountLinks: (params: Stripe.AccountLinkCreateParams) => Promise<Stripe.AccountLink>;
    getConnectAccount: (accountId: string) => Promise<Stripe.Account>;
}

export class StripeUtil implements IStripeUtil {
    async createConnectAccount({ email }: CreateConnectAccountInput): Promise<Stripe.Account> {
        try {
            const account: Stripe.Response<Stripe.Account> = await stripe.accounts.create({
                type: "express",
                email,
                country: "JP",
                capabilities: {
                    card_payments: {
                        requested: true,
                    },
                    transfers: {
                        requested: true,
                    },
                },
            });
            return account;
        } catch (error) {
            Log(error);
        }
    }

    async createAccountLinks({ account, type }): Promise<Stripe.AccountLink> {
        const accountLink: Stripe.Response<Stripe.AccountLink> = await stripe.accountLinks.create({
            account,
            refresh_url: refreshURL,
            return_url: returnURL,
            type,
            collect: "eventually_due",
        });
        return accountLink;
    }

    async getConnectAccount(accountId: string): Promise<Stripe.Account> {
        const account = await stripe.accounts.retrieve({ stripeAccount: accountId });
        return account;
    }
}
