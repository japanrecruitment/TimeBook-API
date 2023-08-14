import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Log } from "@utils/index";
import { HostObject, toHostSelect } from "./HostObject";
import { StripeLib } from "@libs/paymentProvider";

type MyHostInfoArgs = any;

type MyHostInfoResult = Promise<HostObject>;

type MyHostInfo = IFieldResolver<any, Context, MyHostInfoArgs, MyHostInfoResult>;

const host: MyHostInfo = async (_, __, { authData, store }, info) => {
    const { accountId } = authData;

    const hostAccount = await store.host.findUnique({
        where: { accountId },
        ...toHostSelect(mapSelections(info)),
    });

    Log(hostAccount);
    if (!hostAccount) return null;

    if (hostAccount.suspended)
        throw new GqlError({
            code: "UNAUTHORIZED",
            message: "アカウントは停止されました。 サポートにお問い合わせください。",
        });

    const hasPhotoId = hostAccount.photoId?.large || hostAccount.photoId?.medium || hostAccount.photoId?.small;

    const stripe = new StripeLib();

    const hasStripeAccount =
        hostAccount.stripeAccountId && (await stripe.getStripeAccount(hostAccount.stripeAccountId));

    if (!hostAccount.approved) {
        if (hasPhotoId && hasStripeAccount.balance) {
            throw new GqlError({ code: "PENDING_APPROVAL", message: "アカウントは承認待ちです。" });
        }
    }

    return hostAccount;
};

export const myHostInfoTypeDefs = gql`
    type Query {
        host: Host @auth(requires: [user, host])
    }
`;

export const myHostInfoResolvers = {
    Query: { host },
};
