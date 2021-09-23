import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { beAHostResolvers, beAHostTypeDefs } from "./beAHost";
import { hostObjectResolvers, hostObjectTypeDefs } from "./HostObject";
import { myHostInfoResolvers, myHostInfoTypeDefs } from "./myHostInfo";

export const hostTypeDefs = mergeTypeDefs([hostObjectTypeDefs, beAHostTypeDefs, myHostInfoTypeDefs]);

export const hostResolvers = mergeResolvers([hostObjectResolvers, beAHostResolvers, myHostInfoResolvers]);

export * from "./HostObject";
