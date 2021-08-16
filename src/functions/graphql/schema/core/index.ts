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
    float100ScalarTypeDefs,
    intIDScalarTypeDefs,
    paginationOptionTypeDefs,
    resultTypeDefs,
    upperFirstLetterDirectiveTypeDefs,
]);

export const coreResolvers = mergeResolvers([dateScalarResolvers, float100ScalarResolvers, intIDScalarResolvers]);

export const coreDirectives = merge(authDirectives, upperFirstLetterDirective);
