import { IFieldResolver } from "@graphql-tools/utils";
import { Host as IHost, Photo } from "@prisma/client";
import { gql } from "apollo-server-core";
import { mapSelections, toPrismaSelect } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";

import { AccountLink, StripeLib } from "@libs/index";
import { Log, omit } from "@utils/index";
import { photoSelect } from "../media";

type THost = IFieldResolver<any, Context, Record<string, any>, Promise<Partial<IHost>>>;

const host: THost = async (_, __, { authData, store }, info) => {
    const { accountId } = authData;
    const Host = mapSelections(info);

    const select = toPrismaSelect({
        ...omit(Host, "account", "photoId", "profilePhoto"),
        suspended: true,
        approved: true,
        stripeAccountId: true,
        photoId: Host.photoId ? photoSelect : false,
        profilePhoto: Host.profilePhoto ? photoSelect : false,
    });

    const hostAccount: Partial<IHost & { account: AccountLink; profilePhot: Photo; photoId: Photo }> =
        await store.host.findUnique({
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

export const hostTypeDefs = gql`
    enum HostType {
        Individual
        Corporate
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
        approved: Boolean
        photoId: Photo
        profilePhoto: Photo
        stripeAccountId: String
        account: StripeAccount
        createdAt: Date
        updatedAt: Date
    }

    type Query {
        host: Host @auth(requires: [user, host])
    }
`;

export const hostResolvers = {
    Query: { host },
};
