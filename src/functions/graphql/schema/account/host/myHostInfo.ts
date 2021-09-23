import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../../context";
import { GqlError } from "../../../error";
import { Log } from "@utils/index";
import { HostObject, toHostSelect } from "./HostObject";

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
            message: "Your account has been suspended. Please contact support.",
        });

    if (!hostAccount.approved)
        throw new GqlError({ code: "PENDING_APPROVAL", message: "Your account is pending approval." });

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
