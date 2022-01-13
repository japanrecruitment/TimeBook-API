import { IObjectTypeResolver } from "@graphql-tools/utils";
import { AccountLink, StripeLib } from "@libs/paymentProvider";
import { Host } from "@prisma/client";
import { Log } from "@utils/logger";
import { omit, pick } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "../../../context";
import { Photo, PhotoSelect, toPhotoSelect } from "../../media";

export type HostObject = Partial<Host> & {
    stripeAccount?: Partial<AccountLink>;
    profilePhoto?: Partial<Photo>;
    photoId?: Partial<Photo>;
};

export type HostSelect = {
    id: boolean;
    type: boolean;
    name: boolean;
    approved: true;
    suspended: true;
    accountId: true;
    photoId: PrismaSelect<PhotoSelect>;
    profilePhoto: PrismaSelect<PhotoSelect>;
    stripeAccountId: boolean;
};

export const toHostSelect = (selections, defaultValue: any = false): PrismaSelect<HostSelect> => {
    if (!selections || isEmpty(selections)) return defaultValue;
    const photoIdSelect = toPhotoSelect(selections?.photoId);
    const profilePhotoSelect = toPhotoSelect(selections?.profilePhoto);
    const hostSelect = pick(selections, "id", "type", "name", "stripeAccountId");

    if (isEmpty(hostSelect) && !photoIdSelect && !profilePhotoSelect && !selections.stripeAccount) return defaultValue;

    return {
        select: {
            ...hostSelect,
            id: true,
            approved: true,
            suspended: true,
            accountId: true,
            stripeAccountId: true,
            photoId: photoIdSelect,
            profilePhoto: profilePhotoSelect,
        } as HostSelect,
    };
};

const hostResolver: IObjectTypeResolver<HostObject, Context> = {
    stripeAccount: async ({ stripeAccountId }) => {
        if (!stripeAccountId) return;
        const stripe = new StripeLib();
        const stripeAccount = await stripe.getStripeAccount(stripeAccountId);
        Log(stripeAccount);
        return stripeAccount;
    },
    account: async ({ stripeAccountId }) => {
        if (!stripeAccountId) return;
        const stripe = new StripeLib();
        const stripeAccount = await stripe.getStripeAccount(stripeAccountId);
        Log(stripeAccount);
        return stripeAccount;
    },
};

export const hostObjectTypeDefs = gql`
    enum HostType {
        Individual
        Corporate
    }

    type Balance {
        amount: Int
        currency: String
    }

    type StripeAccountBalance {
        available: [Balance]
        pending: [Balance]
    }

    type StripeAccount {
        message: String
        balance: StripeAccountBalance
        url: String!
    }

    type Host {
        id: ID!
        type: HostType
        name: String
        approved: Boolean
        photoId: Photo
        profilePhoto: Photo
        stripeAccountId: String
        stripeAccount: StripeAccount
        account: StripeAccount
        accountId: String
        createdAt: Date
        updatedAt: Date
    }
`;

export const hostObjectResolvers = {
    Host: hostResolver,
};
