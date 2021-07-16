import { mergeTypeDefs } from "@graphql-tools/merge";
import { merge } from "lodash";
import { authDirectives } from "./authDirective";
import { resultTypeDefs } from "./result";
import { upperFirstLetterDirective } from "./upperFirstLetterDirective";

export const coreTypeDefs = mergeTypeDefs([resultTypeDefs]);

export const coreDirectives = merge(authDirectives, upperFirstLetterDirective);
