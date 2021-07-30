import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { merge } from "lodash";
import { authDirectives, authDirectiveTypeDefs } from "./authDirective";
import { dateScalarResolvers, dateScalarTypeDefs } from "./dateScalar";
import { float100ScalarResolvers, float100ScalarTypeDefs } from "./float100Scalar";
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
    float100ScalarTypeDefs,
]);

export const coreResolvers = mergeResolvers([dateScalarResolvers, intIDScalarResolvers, float100ScalarResolvers]);

export const coreDirectives = merge(authDirectives, upperFirstLetterDirective);
