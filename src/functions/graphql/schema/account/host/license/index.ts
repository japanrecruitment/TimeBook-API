import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addLicenseResolvers, addLicenseTypeDefs } from "./addLicense";
import { approveLicenseResolvers, approveLicenseTypeDefs } from "./approveLicense";
import { getLicensesByAccountIdResolvers, getLicensesByAccountIdTypeDefs } from "./getLicensesByAccountId";
import { getMyLicensesResolvers, getMyLicensesTypeDefs } from "./getMyLicenses";
import { licenseObjectTypeDefs } from "./LicenseObject";
import { rejectLicenseResolvers, rejectLicenseTypeDefs } from "./rejectLicense";

export const licenseTypeDefs = mergeTypeDefs([
    licenseObjectTypeDefs,
    addLicenseTypeDefs,
    approveLicenseTypeDefs,
    rejectLicenseTypeDefs,
    getMyLicensesTypeDefs,
    getLicensesByAccountIdTypeDefs,
]);

export const licenseResolvers = mergeResolvers([
    addLicenseResolvers,
    approveLicenseResolvers,
    rejectLicenseResolvers,
    getMyLicensesResolvers,
    getLicensesByAccountIdResolvers,
]);

export * from "./LicenseObject";
