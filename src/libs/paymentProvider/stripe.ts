import Stripe from "stripe";
import { environment, Log } from "@utils/index";
import { isEmpty, uniqWith } from "lodash";

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

export type StripePrice = Omit<Stripe.Price, "product"> & { product: Stripe.Product };

export type StripeSubscriptionItem = Omit<Stripe.SubscriptionItem, "price"> & { price: StripePrice };

export type StripeSubscription = Omit<Stripe.Subscription, "items"> & { items: Stripe.ApiList<StripeSubscriptionItem> };
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
            Log(customer);
            return customer.id;
        } catch (error) {
            console.log(error);
        }
    }

    async getCustomer(customerId: string): Promise<Stripe.Response<Stripe.Customer>> {
        try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer.deleted) return null;
            return customer as any;
        } catch (error) {
            console.log(error);
        }
    }

    async setDefaultPaymentSource(
        customerId: string,
        paymentMethodId: string
    ): Promise<Stripe.Response<Stripe.Customer>> {
        try {
            const customer = await stripe.customers.update(customerId, {
                invoice_settings: { default_payment_method: paymentMethodId },
            });
            return customer as any;
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

    async detachPaymentMethodToCustomer(paymentMethodId: string) {
        try {
            const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
            return paymentMethod;
        } catch (error) {
            console.log(error);
        }
    }

    async listSources(
        customerId: string,
        paymentSourceType: Stripe.PaymentMethodListParams.Type
    ): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
        try {
            const sources = await stripe.paymentMethods.list({
                customer: customerId,
                type: paymentSourceType,
            });
            Log("payment methods:", sources);
            return sources;
        } catch (error) {
            Log(error);
        }
    }

    async retrieveCard(customerId: string) {
        try {
            const cards = (await this.listSources(customerId, "card")).data as Array<Stripe.PaymentMethod>;
            Log("retriveCard cards", cards);
            return cards;
        } catch (error) {
            Log(error);
        }
    }

    async retrievePaymentMethod(paymentMethodId: string) {
        try {
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
            Log("retrivePaymentMethod paymentMethod:", paymentMethod);
            return paymentMethod;
        } catch (error) {
            Log(error);
        }
    }

    async cancelPaymentIntent(id: Stripe.PaymentIntent["id"]) {
        try {
            Log("[STARTED]: Cancel stripe payment intent", id);
            const intent = await stripe.paymentIntents.cancel(id);
            Log("[COMPLETED]: Cancel stripe payment intent", intent);
            return intent;
        } catch (error) {
            Log("[FAILED]: Cancel stripe payment intent", error);
            return error;
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

    async setupPaymentIntent(
        params: Stripe.SetupIntentCreateParams,
        options?: Stripe.RequestOptions
    ): Promise<Stripe.Response<Stripe.SetupIntent>> {
        try {
            Log("[STARTED]: Creating stripe setup payment intent", params, options);
            const intent = await stripe.setupIntents.create(params, options);
            Log("[COMPLETED]: Creating stripe setup payment intent", intent);
            return intent;
        } catch (error) {
            Log("[FAILED]: Creating stripe setup payment intent", error);
            return error;
        }
    }

    async retrievePaymentIntent(id: string): Promise<Stripe.Response<Stripe.PaymentIntent>> {
        try {
            Log("[STARTED]: Retrieving stripe payment intent", id);
            const intent = await stripe.paymentIntents.retrieve(id);
            Log("[COMPLETED]: Retrieving stripe payment intent", intent);
            return intent;
        } catch (error) {
            Log("[FAILED]: Retrieving stripe payment intent", error);
            return error;
        }
    }

    async capturePayment(paymentIntentId: string) {
        try {
            Log("[STARTED]: Capturing stripe payment intent", paymentIntentId);
            const intent = await stripe.paymentIntents.capture(paymentIntentId);
            Log("[COMPLETED]: Capturing stripe payment intent", intent);
            return intent;
        } catch (error) {
            Log("[FAILED]: Capturing stripe payment intent", error);
            return error;
        }
    }

    async createSubscription(
        customerId: string,
        priceId: string,
        productType: string,
        accountId: string
    ): Promise<Stripe.Response<Stripe.Subscription>> {
        try {
            Log("[STARTED]: Creating subscription");
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: priceId }],
                collection_method: "charge_automatically",
                metadata: { productType, accountId },
                // payment_behavior: "default_incomplete",
                // expand: ["latest_invoice.payment_intent"],
            });
            Log("[COMPLETED]: Creating subscription", subscription);
            return subscription as any;
        } catch (error) {
            Log("[FAILED]: Creating subscription", error);
            throw error;
        }
    }

    async cancelSubscription(subscriptionId: string): Promise<Stripe.Response<Stripe.Subscription>> {
        try {
            Log("[STARTED]: Canceling subscription");
            const subscription = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
            Log("[COMPLETED]: Canceling subscription", subscription);
            return subscription as any;
        } catch (error) {
            Log("[FAILED]: Canceling subscription", error);
            return error;
        }
    }

    async listSubscriptions(accountId: string, productType?: string): Promise<StripeSubscription[]> {
        try {
            Log("[STARTED]: Retrieving stripe subscription list");
            let query = `metadata['accountId']: '${accountId}' AND status: 'active'`;
            query = productType ? `${query} AND metadata['productType']: '${productType}'` : query;
            const subscriptions = await stripe.subscriptions.search({ query });
            if (isEmpty(subscriptions.data)) return [];
            const productIds = subscriptions.data
                .flatMap(({ items }) => items.data)
                .flatMap(({ price }) => price.product as string);
            const products = await stripe.products.list({ ids: productIds });
            Log("[COMPLETED]: Retrieving stripe subscription list", subscriptions);
            return subscriptions.data.map((sub) => ({
                ...sub,
                items: {
                    ...sub.items,
                    data: sub.items.data.map((subItem) => ({
                        ...subItem,
                        price: {
                            ...subItem.price,
                            product: products.data.find((product) => product.id === subItem.price.product),
                        },
                    })),
                },
            }));
        } catch (error) {
            Log("[FAILED]: Retrieving stripe subscription list", error);
            return error;
        }
    }

    async retrievePrice(priceId: string): Promise<Stripe.Response<StripePrice>> {
        try {
            Log("[STARTED]: Retrieving stripe price");
            const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
            Log("[COMPLETED]: Retrieving stripe price", price);
            return price as any;
        } catch (error) {
            Log("[FAILED]: Retrieving stripe price", error);
            return error;
        }
    }

    async listPrices(): Promise<Stripe.Response<StripePrice[]>> {
        const productIds = [
            "prod_MHKkvxYDSR3Utl",
            "prod_MHL3nbPl5b5I7y",
            "prod_MHL95AQUXuIU5P",
            "prod_MHLC0GjKiwd7oN",
            "prod_MHLEuTMpuVEuDh",
            "prod_MHLHPCH1h6bU6V",
        ];
        try {
            Log("[STARTED]: Fetching stripe subscription prices");
            const prices = await stripe.prices.search({
                query: productIds.map((id) => `product: '${id}'`).join(" OR "),
                expand: ["data.product"],
                limit: 18,
            });
            Log("[COMPLETED]: Fetching stripe subscription prices", prices);
            return prices.data as any;
        } catch (error) {
            Log("[FAILED]: Fetching stripe subscription prices", error);
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
        Log("[STARTED]: Validating webhook.");
        const endpointSecret = environment.STRIPE_WEBHOOK_SECRET;
        const signature = event.headers["Stripe-Signature"] || event.headers["stripe-signature"];
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
