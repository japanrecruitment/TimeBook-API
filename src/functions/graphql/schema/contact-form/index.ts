import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { contactFormTypeDefs as contactTypeDefs, contactFormResolvers as contactResolver } from "./contact";

export const contactFormTypeDefs = mergeTypeDefs([contactTypeDefs]);

export const contactFormResolvers = mergeResolvers([contactResolver]);
