import { IFieldResolver } from "@graphql-tools/utils";
import { formatJSONResponse } from "@libs/apiGateway";
import { StripeLib } from "@libs/paymentProvider";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";

export type PaymentSource = {
    id: string | number;
    customer: string;
    token: string;
    type: string;
    expMonth: number;
    expYear: number;
    last4: string;
    brand: string;
    country: string;
};

type TPaymentSource = IFieldResolver<any, Context, Record<string, any>, Promise<PaymentSource[]>>;

const paymentSource: TPaymentSource = async (_, __, { authData, store }, info) => {
    try {
        const { accountId } = authData;

        const test = await store.account.findUnique({
            where: { id: accountId },
            select: { userProfile: { select: { stripeCustomerId: true } } },
        });

        const account = await store.account.findUnique({
            where: { id: accountId },
            select: { userProfile: { select: { stripeCustomerId: true } } },
        });

        if (!account.userProfile) {
            throw new GqlError({ code: "FORBIDDEN", message: "無効なリクエスト" });
        }

        const { stripeCustomerId } = account.userProfile;

        if (!stripeCustomerId) {
            return [] as Array<PaymentSource>;
        }

        // Get payment sources from stripe
        const stripe = new StripeLib();
        const customer = await stripe.getCustomer(stripeCustomerId);

        if (!customer) throw new GqlError({ code: "BAD_REQUEST", message: "顧客IDが見つかりません" });

        const paymentSources = await stripe.retrieveCard(stripeCustomerId);

        Log("PAYMENT SOURCE", paymentSources);
        if (!paymentSources) return [];
        const result: PaymentSource[] = paymentSources.map((source) => {
            return {
                id: source.id,
                customer: source.customer as string,
                token: source.id,
                type: source.type,
                expMonth: source.card.exp_month,
                expYear: source.card.exp_year,
                last4: source.card.last4,
                brand: source.card.brand,
                country: source.card.country,
                isDefault: customer.invoice_settings.default_payment_method === source.id,
            };
        });
        return result;
    } catch (error) {
        Log("[paymentSource error]: ", error);
        throw new GqlError({ code: "INTERNAL ERROR", message: "不明なエラーです" });
    }
};

export const paymentSourceTypeDefs = gql`
    type PaymentSource {
        id: ID!
        customer: String
        token: String
        type: String
        expMonth: Int
        expYear: Int
        last4: String
        brand: String
        country: String
        isDefault: Boolean
    }

    type Query {
        paymentSource: [PaymentSource] @auth(requires: [user], allowSelf: true)
    }
`;

export const paymentSourceResolvers = {
    Query: { paymentSource },
};

export type PaymentMethod = {
    id: string | number;
    customer: string;
    token: string;
    type: string;
    expMonth: number;
    expYear: number;
    last4: string;
    brand: string;
    country: string;
};

export type PaymentMethodInput = {
    paymentMethodId: string;
};
