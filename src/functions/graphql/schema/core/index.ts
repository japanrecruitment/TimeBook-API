import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { merge } from "lodash";
import { authDirectives, authDirectiveTypeDefs } from "./authDirective";
import { dateScalarResolvers, dateScalarTypeDefs } from "./dateScalar";
import { intIDScalarResolvers, intIDScalarTypeDefs } from "./intIDScalar";
import { paginationOptionTypeDefs } from "./paginationOption";
import { resultTypeDefs } from "./result";
import { upperFirstLetterDirective, upperFirstLetterDirectiveTypeDefs } from "./upperFirstLetterDirective";

export const coreTypeDefs = mergeTypeDefs([
    authDirectiveTypeDefs,
    dateScalarTypeDefs,
    intIDScalarTypeDefs,
    paginationOptionTypeDefs,
    resultTypeDefs,
    upperFirstLetterDirectiveTypeDefs,
]);

export const coreResolvers = mergeResolvers([dateScalarResolvers, intIDScalarResolvers]);

export const coreDirectives = merge(authDirectives, upperFirstLetterDirective);
