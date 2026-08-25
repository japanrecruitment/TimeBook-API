import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { beAHostResolvers, beAHostTypeDefs } from "./beAHost";
import { hostObjectResolvers, hostObjectTypeDefs } from "./HostObject";
import { myHostInfoResolvers, myHostInfoTypeDefs } from "./myHostInfo";
import { registerHostResolvers, registerHostTypeDefs } from "./registerHost";
import { addHostPhotoIdResolvers, addHostPhotoIdTypeDefs } from "./addHostPhotoId";
import { licenseResolvers, licenseTypeDefs } from "./license";
import { updateHostCommissionRateResolvers, updateHostCommissionRateTypeDefs } from "./updateHostCommissionRate";
import { forceDeleteHostAccountResolvers, forceDeleteHostAccountTypeDefs } from "./forceDeleteHostAccount";

export const hostTypeDefs = mergeTypeDefs([
    hostObjectTypeDefs,
    beAHostTypeDefs,
    myHostInfoTypeDefs,
    registerHostTypeDefs,
    addHostPhotoIdTypeDefs,
    licenseTypeDefs,
    updateHostCommissionRateTypeDefs,
    forceDeleteHostAccountTypeDefs,
]);

export const hostResolvers = mergeResolvers([
    hostObjectResolvers,
    beAHostResolvers,
    myHostInfoResolvers,
    registerHostResolvers,
    addHostPhotoIdResolvers,
    licenseResolvers,
    updateHostCommissionRateResolvers,
    forceDeleteHostAccountResolvers,
]);

export * from "./HostObject";
