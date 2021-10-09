import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { merge } from "lodash";
import { authDirectives, authDirectiveTypeDefs } from "./authDirective";
import { dateScalarResolvers, dateScalarTypeDefs } from "./dateScalar";
import { float100ScalarResolvers, float100ScalarTypeDefs } from "./float100Scalar";
import { intIDScalarResolvers, intIDScalarTypeDefs } from "./intIDScalar";
import { resultTypeDefs } from "./result";
import { upperFirstLetterDirective, upperFirstLetterDirectiveTypeDefs } from "./upperFirstLetterDirective";
import { signMediaReadDirective, signMediaReadDirectiveTypeDefs } from "./signMediaReadDirective";
import { paginationTypeDefs } from "./pagination";
import { base64ScalarReolvers, base64ScalarTypeDefs } from "./base64Scalar";

export const coreTypeDefs = mergeTypeDefs([
    authDirectiveTypeDefs,
    base64ScalarTypeDefs,
    dateScalarTypeDefs,
    float100ScalarTypeDefs,
    intIDScalarTypeDefs,
    paginationTypeDefs,
    resultTypeDefs,
    upperFirstLetterDirectiveTypeDefs,
    signMediaReadDirectiveTypeDefs,
]);

export const coreResolvers = mergeResolvers([
    base64ScalarReolvers,
    dateScalarResolvers,
    float100ScalarResolvers,
    intIDScalarResolvers,
]);

export const coreDirectives = merge(authDirectives, upperFirstLetterDirective, signMediaReadDirective);
