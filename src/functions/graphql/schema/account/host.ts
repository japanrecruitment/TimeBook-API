import { IFieldResolver } from "@graphql-tools/utils";
import { Host, ProfileType, Role } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";
import { Result } from "../core/result";
import { GqlError } from "../../error";

import { HostType } from "@prisma/client";
import { AccountLink, StripeLib } from "@libs/index";
import { omit } from "@utils/object-helper";

type THost = IFieldResolver<any, Context, Record<string, any>, Promise<Partial<Host>>>;

const host: THost = async (_, __, { authData, store }, info) => {
    const { accountId } = authData;

    const { Host } = mapSelections(info);

    const select = toPrismaSelect(omit(Host, "account"));

    const hostAccount: Partial<Host & { account: AccountLink }> = await store.host.findUnique({
        where: { accountId },
        ...select,
    });

    Log(hostAccount);
    if (!hostAccount) return null;

    if (hostAccount.suspended)
        throw new GqlError({
            code: "UNAUTHORIZED",
            message: "Your account has been suspended. Please contact support.",
        });

    if (!hostAccount.approved)
        throw new GqlError({ code: "PENDING_APPROVAL", message: "Your account is pending approval." });

    const stripe = new StripeLib();
    // check if onboarding is finished
    if (hostAccount.stripeAccountId) {
        // Initialize Stripe Library
        hostAccount.account = await stripe.getStripeAccount(hostAccount.stripeAccountId);
        Log(hostAccount.account);
    } else {
        throw new GqlError({ code: "FINISH_REGISTRATION", message: "Finish your registration." });
    }

    return hostAccount;
};

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
    enum HostType {
        Individual
        Corporate
    }

    input BeAHostInput {
        type: HostType
        name: String
    }

    type StripeAccount {
        message: String
        balance: StripeAccountBalance
        url: String!
    }

    type Balance {
        amount: Int
        currency: String
    }

    type StripeAccountBalance {
        available: [Balance]
        pending: [Balance]
    }

    type Host {
        id: ID!
        type: HostType
        name: String
        stripeAccountId: String
        account: StripeAccount
        createdAt: Date
        updatedAt: Date
    }

    type BeAHostResult {
        message: String
        url: String!
    }

    type Query {
        host: Host @auth(requires: [user, host])
    }

    type Mutation {
        beAHost(input: BeAHostInput): BeAHostResult! @auth(requires: [user])
    }
`;

export const hostResolvers = {
    Query: { host },
    Mutation: { beAHost },
};
