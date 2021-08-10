import { IFieldResolver } from "@graphql-tools/utils";
import { Host, ProfileType, Role } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";
import { Result } from "../core/result";
import { GqlError } from "../../error";

import { HostType } from "@prisma/client";
import { StripeUtil } from "@libs/index";
import Stripe from "stripe";

type THost = IFieldResolver<any, Context, Record<string, any>, Promise<Partial<Host>>>;

const host: THost = async (_, __, { authData, store }, info) => {
    const select = toPrismaSelect(mapSelections(info));
    const { accountId } = authData;

    let hostAccount = await store.host.findUnique({
        where: { accountId },
        ...select,
    });

    Log(hostAccount);
    if (!hostAccount) return null;

    return hostAccount;
};

type RegisterHostInput = {
    type: HostType;
    name: string;
};

type RegisterHostResponse = {
    url: string;
};

type RegisterHost = IFieldResolver<
    any,
    Context,
    Record<"input", RegisterHostInput>,
    Promise<Result & RegisterHostResponse>
>;

const registerHost: RegisterHost = async (_, { input }, { store, authData }) => {
    const { accountId, profileType } = authData;
    const { type, name } = input;

    // Initialize Stripe Library
    const stripe = new StripeUtil();

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
            const stripeAccount = await stripe.getConnectAccount(hostAccount.stripeAccountId);

            if (!stripeAccount.details_submitted) {
                // detail submission isn't completed yet
                const accountLink = await stripe.createAccountLinks({
                    account: hostAccount.stripeAccountId,
                    type: "account_onboarding",
                });
                return {
                    message: `Provide neccessary information.`,
                    url: accountLink.url,
                };
            }

            throw new GqlError({ code: "BAD_USER_INPUT", message: "Already a host." });
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

    input HostInput {
        type: HostType
        name: String
    }

    type Host {
        id: ID!
        type: HostType
        name: String
        stripeAccountId: String
        createdAt: Date
        updatedAt: Date
    }

    type HostResult {
        message: String
        url: String!
    }

    type Query {
        host: Host @auth(requires: [user, host])
    }

    type Mutation {
        registerHost(input: HostInput): HostResult! @auth(requires: [user])
    }
`;

export const hostResolvers = {
    Query: { host },
    Mutation: { registerHost },
};
