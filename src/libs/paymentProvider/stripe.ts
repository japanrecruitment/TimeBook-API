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
    createCustomer: (customerId: string, email: string) => any;
    getCustomer: (customerId: string) => any;
    attachPaymentMethodToCustomer: (customerId: string, paymentMethodId: string) => any;
}

export type AccountLink = {
    message: string;
    url: string;
    balance: AccountBalance;
};

type Balance = {
    currency: string;
    amount: number;
};
export type AccountBalance = {
    available: Balance[];
    pending: Balance[];
};

export class StripeLib implements IStripeUtil {
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

    async createLoginLink(accountId: string): Promise<Stripe.LoginLink> {
        const loginLink: Stripe.Response<Stripe.LoginLink> = await stripe.accounts.createLoginLink(accountId);
        return loginLink;
    }

    async getConnectAccount(accountId: string): Promise<Stripe.Account> {
        return await stripe.accounts.retrieve({ stripeAccount: accountId });
    }

    async getAccountBalance(accountId: string): Promise<Stripe.Balance> {
        return await stripe.balance.retrieve({ stripeAccount: accountId });
    }

    async getStripeAccount(accountId: string): Promise<AccountLink> {
        // Check stripe account requirement hash
        const stripeAccount = await this.getConnectAccount(accountId);

        if (!stripeAccount.details_submitted) {
            // detail submission isn't completed yet
            const accountLink = await this.createAccountLinks({
                account: accountId,
                type: "account_onboarding",
            });
            return {
                message: `Provide neccessary information.`,
                url: accountLink.url,
                balance: null,
            };
        } else {
            // all details have been submitted
            const loginLink = await this.createLoginLink(accountId);
            const { available, pending } = await this.getAccountBalance(accountId);

            Log(available, pending);

            return {
                message: `View account details.`,
                url: loginLink.url,
                balance: {
                    available,
                    pending,
                },
            };
        }
    }

    async createCustomer(accountId: string, email: string) {
        try {
            const customer = await stripe.customers.create({
                email,
                metadata: {
                    accountId,
                },
            });
            return customer.id;
        } catch (error) {
            console.log(error);
        }
    }

    async getCustomer(customerId: string) {
        try {
            const customer = await stripe.customers.retrieve(customerId);
            return customer;
        } catch (error) {
            console.log(error);
        }
    }

    async attachPaymentMethodToCustomer(customerId: string, paymentMethodId: string) {
        try {
            const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });
            return paymentMethod;
        } catch (error) {
            console.log(error);
        }
    }

    async createPaymentIntent(
        params: Stripe.PaymentIntentCreateParams,
        options?: Stripe.RequestOptions
    ): Promise<Stripe.Response<Stripe.PaymentIntent>> {
        try {
            Log("[STARTED]: Creating stripe payment intent", params, options);
            const intent = await stripe.paymentIntents.create(params, options);
            Log("[COMPLETED]: Creating stripe payment intent", intent);
            return intent;
        } catch (error) {
            Log("[FAILED]: Creating stripe payment intent", error);
            return error;
        }
    }

    validateWebhook(
        event,
        callbacks: {
            onSuccess?: (paymentIntent: Stripe.PaymentIntent) => void;
            onUnhandledWebhook?: (paymentIntent: Stripe.PaymentIntent) => void;
            onFailed?: (paymentIntent: Stripe.PaymentIntent) => void;
            onCanceled?: (paymentIntent: Stripe.PaymentIntent) => void;
            onError?: (error: any) => void;
        } = { onUnhandledWebhook: () => {} }
    ) {
        const { onSuccess, onFailed, onCanceled, onError, onUnhandledWebhook } = callbacks;
        Log("[STARTED]: Validating webhook.", event);
        const endpointSecret = process.env.STRIPE_WH_KEY;
        const signature = event.headers["stripe-signature"];
        try {
            const hook: Stripe.Event = stripe.webhooks.constructEvent(event.body, signature, endpointSecret);
            const intent = hook.data?.object as Stripe.PaymentIntent;
            switch (hook.type) {
                case "payment_intent.succeeded":
                    onSuccess && onSuccess(intent);
                    Log("[COMPLETED]: Validating webhook.", intent);
                    return;
                case "payment_intent.payment_failed":
                    onFailed ? onFailed(intent) : onUnhandledWebhook(intent);
                    Log("[FAILED]: Validating webhook.", intent);
                    break;
                case "payment_intent.canceled":
                    onCanceled ? onCanceled(intent) : onUnhandledWebhook(intent);
                    Log("[CANCELED]: Validating webhook.", intent);
                    break;
                default:
                    onUnhandledWebhook(intent);
                    Log("[UNHANDLED]: Validating webhook.", intent);
            }
        } catch (error) {
            onError(error);
            Log("[FAILED]: Validating webhook.", error);
        }
    }
}
