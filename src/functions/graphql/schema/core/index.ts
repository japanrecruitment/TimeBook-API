import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { merge } from "lodash";
import { authDirectives, authDirectiveTypeDefs } from "./authDirective";
import { dateScalarResolvers, dateScalarTypeDefs } from "./dateScalar";
import { resultTypeDefs } from "./result";
import { upperFirstLetterDirective, upperFirstLetterDirectiveTypeDefs } from "./upperFirstLetterDirective";

export const coreTypeDefs = mergeTypeDefs([
    authDirectiveTypeDefs,
    dateScalarTypeDefs,
    resultTypeDefs,
    upperFirstLetterDirectiveTypeDefs,
]);

export const coreResolvers = mergeResolvers([dateScalarResolvers]);

export const coreDirectives = merge(authDirectives, upperFirstLetterDirective);
