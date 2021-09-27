import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { beAHostResolvers, beAHostTypeDefs } from "./beAHost";
import { hostObjectResolvers, hostObjectTypeDefs } from "./HostObject";
import { myHostInfoResolvers, myHostInfoTypeDefs } from "./myHostInfo";
import { registerHostResolvers, registerHostTypeDefs } from "./registerHost";

export const hostTypeDefs = mergeTypeDefs([
    hostObjectTypeDefs,
    beAHostTypeDefs,
    myHostInfoTypeDefs,
    registerHostTypeDefs,
]);

export const hostResolvers = mergeResolvers([
    hostObjectResolvers,
    beAHostResolvers,
    myHostInfoResolvers,
    registerHostResolvers,
]);

export * from "./HostObject";
