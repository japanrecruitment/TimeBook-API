import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { beAHostResolvers, beAHostTypeDefs } from "./beAHost";
import { hostObjectResolvers, hostObjectTypeDefs } from "./HostObject";
import { myHostInfoResolvers, myHostInfoTypeDefs } from "./myHostInfo";
import { registerHostResolvers, registerHostTypeDefs } from "./registerHost";
import { addHostPhotoIdResolvers, addHostPhotoIdTypeDefs } from "./addHostPhotoId";

export const hostTypeDefs = mergeTypeDefs([
    hostObjectTypeDefs,
    beAHostTypeDefs,
    myHostInfoTypeDefs,
    registerHostTypeDefs,
    addHostPhotoIdTypeDefs,
]);

export const hostResolvers = mergeResolvers([
    hostObjectResolvers,
    beAHostResolvers,
    myHostInfoResolvers,
    registerHostResolvers,
    addHostPhotoIdResolvers,
]);

export * from "./HostObject";
