import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/paymentProvider";
import { appConfig } from "@utils/appConfig";
import { Log } from "@utils/logger";
import { omit } from "@utils/object-helper";
import { formatPrice } from "@utils/stringHelper";
import { gql } from "apollo-server-core";
import Stripe from "stripe";
import { Context } from "../../context";
import { GqlError } from "../../error";

type ReserveSpaceInput = {
    fromDateTime: Date;
    paymentSourceId: string;
    spaceId: string;
    toDateTime: Date;
};

type ReserveSpaceArgs = { input: ReserveSpaceInput };

type ReserveSpaceResult = {
    transactionId: string;
    intentId: string;
    intentCode: string;
    amount: number;
    description: string;
    currency: string;
    paymentMethodTypes: string[];
};

type ReserveSpace = IFieldResolver<any, Context, ReserveSpaceArgs, Promise<ReserveSpaceResult>>;

const reserveSpace: ReserveSpace = async (_, { input }, { authData, store }) => {
    const { accountId, email } = authData;
    const { fromDateTime, paymentSourceId, spaceId, toDateTime } = input;

    if (fromDateTime.getTime() < Date.now() || toDateTime.getTime() < Date.now())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Selected time frame is invalid" });

    const hourDuration = Math.ceil(Math.abs(toDateTime.getTime() - fromDateTime.getTime()) / (1000 * 60 * 60));

    Log("hour duration", hourDuration);

    if (hourDuration <= 0) throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid date selection" });

    const space = await store.space.findUnique({
        where: { id: spaceId },
        include: {
            account: { include: { host: true } },
            spacePricePlans: { where: { type: "HOURLY", duration: { lte: hourDuration } } },
        },
    });

    if (!space) throw new GqlError({ code: "NOT_FOUND", message: "Space not found" });

    if (!space.spacePricePlans || space.spacePricePlans.length <= 0)
        throw new GqlError({
            code: "BAD_USER_INPUT",
            message: "Selected time frame doesn't satisfy the minimum required duration to book this space.",
        });

    const paymentSource = await store.paymentSource.findUnique({ where: { id: paymentSourceId } });

    if (!paymentSource) throw new GqlError({ code: "NOT_FOUND", message: "Payment source not found" });

    const price = formatPrice("HOURLY", space.spacePricePlans, true, true);

    const amount = hourDuration * price;
    const applicationFeeAmount = parseInt((amount * (appConfig.platformFeePercent / 100)).toString());
    const transferAmount = amount - applicationFeeAmount;

    Log(amount, applicationFeeAmount, transferAmount);

    const transaction = await store.transaction.create({
        data: {
            amount,
            provider: "STRIPE",
            assetType: "SPACE",
            assetData: omit(space, "createdAt", "account", "spacePricePlans", "updatedAt"),
            currency: "JPY",
            description: `Reservation of ${space.name}`,
            status: "CREATED",
            account: { connect: { id: accountId } },
            reservation: {
                create: {
                    approved: !space.needApproval,
                    fromDateTime,
                    toDateTime,
                    status: "PENDING",
                    space: { connect: { id: spaceId } },
                    reservee: { connect: { id: accountId } },
                },
            },
        },
    });

    const stripe = new StripeLib();
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount,
        currency: "JPY",
        customer: paymentSource.customer,
        payment_method: paymentSource.token,
        payment_method_types: [paymentSource.type.toLowerCase()],
        description: transaction.description,
        receipt_email: email,
        capture_method: space.needApproval ? "manual" : "automatic",
        metadata: {
            transactionId: transaction.id,
            reservationId: transaction.reservationId,
            userId: accountId,
            spaceId: spaceId,
        },
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
            destination: space.account.host.stripeAccountId,
        },
        confirm: true,
    };

    const paymentIntent = await stripe.createPaymentIntent(paymentIntentParams);

    await store.transaction.update({
        where: { id: transaction.id },
        data: {
            paymentIntentId: paymentIntent.id,
            requestedLog: paymentIntentParams as any,
            responseReceivedLog: paymentIntent as any,
        },
    });

    return {
        transactionId: transaction.id,
        intentId: paymentIntent.id,
        intentCode: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        description: paymentIntent.description,
        currency: paymentIntent.currency,
        paymentMethodTypes: paymentIntent.payment_method_types,
    };
};

export const reserveSpaceTypeDefs = gql`
    input ReserveSpaceInput {
        fromDateTime: Date!
        paymentSourceId: ID!
        spaceId: ID!
        toDateTime: Date!
    }

    type ReserveSpaceResult {
        transactionId: ID
        intentId: ID
        intentCode: String
        amount: Float
        description: String
        currency: String
        paymentMethodTypes: [String]
    }

    type Mutation {
        reserveSpace(input: ReserveSpaceInput): ReserveSpaceResult @auth(requires: [user, host])
    }
`;

export const reserveSpaceResolvers = {
    Mutation: { reserveSpace },
};
