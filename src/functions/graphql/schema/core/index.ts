import { mergeTypeDefs } from "@graphql-tools/merge";
import { merge } from "lodash";
import { authDirectives, authDirectiveTypeDefs } from "./authDirective";
import { resultTypeDefs } from "./result";
import { upperFirstLetterDirective, upperFirstLetterDirectiveTypeDefs } from "./upperFirstLetterDirective";

export const coreTypeDefs = mergeTypeDefs([resultTypeDefs, authDirectiveTypeDefs, upperFirstLetterDirectiveTypeDefs]);

export const coreDirectives = merge(authDirectives, upperFirstLetterDirective);
