import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { addLicenseResolvers, addLicenseTypeDefs } from "./addLicense";
import { approveLicenseResolvers, approveLicenseTypeDefs } from "./approveLicense";
import { rejectLicenseResolvers, rejectLicenseTypeDefs } from "./rejectLicense";

export const licenseTypeDefs = mergeTypeDefs([addLicenseTypeDefs, approveLicenseTypeDefs, rejectLicenseTypeDefs]);

export const licenseResolvers = mergeResolvers([addLicenseResolvers, approveLicenseResolvers, rejectLicenseResolvers]);
