import { IFieldResolver } from "@graphql-tools/utils";
import { Host as IHost, ProfileType, Role, HostType, Photo } from "@prisma/client";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { Result } from "../core/result";
import { GqlError } from "../../error";

import { StripeLib } from "@libs/index";

type BeAHostInput = {
    type: HostType;
    name: string;
};

type BeAHostResult = Result & {
    url: string;
};

type BeAHost = IFieldResolver<any, Context, Record<"input", BeAHostInput>, Promise<BeAHostResult>>;

const beAHost: BeAHost = async (_, { input }, { store, authData }) => {
    const { accountId } = authData;
    const { type, name } = input;

    // Initialize Stripe Library
    const stripe = new StripeLib();

    // check if name is valid
    if (!name || name.trim() === "")
        throw new GqlError({
            code: "BAD_USER_INPUT",
            message: "Please provide a valid name for your host account.",
        });

    // Create Host Account on DB
    const account = await store.account.findUnique({
        where: { id: accountId },
        select: { email: true, profileType: true, host: true },
    });

    const { host: hostAccount, email } = account;

    let newHostAccount;

    if (hostAccount) {
        if (hostAccount.stripeAccountId) {
            // Check stripe account requirement hash
            const stripeAccount = await stripe.getStripeAccount(hostAccount.stripeAccountId);
            return stripeAccount;
        } else {
            newHostAccount = hostAccount;
        }
    } else {
        const newHost = {
            type: type || account.profileType === ProfileType.UserProfile ? HostType.Individual : HostType.Corporate,
            name,
        };

        const updatedAccount = await store.account.update({
            where: { id: accountId },
            data: {
                host: { create: newHost },
                roles: {
                    push: Role.host,
                },
            },
            select: { host: true },
        });
        newHostAccount = updatedAccount.host;
    }

    const hostId = newHostAccount.id;
    // create stripe connect account
    const { id: connectId } = await stripe.createConnectAccount({ email });

    // update stripeAccountId
    await store.account.update({
        where: { id: accountId },
        data: {
            host: {
                update: {
                    stripeAccountId: connectId,
                },
            },
        },
    });

    const accountLink = await stripe.createAccountLinks({
        account: connectId,
        type: "account_onboarding",
    });

    return {
        message: `Successfull. Host ID: ${hostId}`,
        url: accountLink.url,
    };
};

export const hostTypeDefs = gql`
    input BeAHostInput {
        type: HostType
        name: String
    }

    type BeAHostResult {
        message: String
        url: String!
    }

    type Mutation {
        beAHost(input: BeAHostInput): BeAHostResult! @auth(requires: [user])
    }
`;

export const hostResolvers = {
    Mutation: { beAHost },
};
