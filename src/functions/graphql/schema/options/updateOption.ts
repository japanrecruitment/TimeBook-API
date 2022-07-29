import { IFieldResolver } from "@graphql-tools/utils";
import { OptionPaymentTerm } from "@prisma/client";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { isEmpty } from "lodash";
import { Context } from "src/functions/graphql/context";
import { GqlError } from "src/functions/graphql/error";
import { OptionObject, toOptionSelect } from "./OptionObject";

function validateUpdateOptionInput(input: UpdateOptionInput): UpdateOptionInput {
    let {
        id,
        additionalPrice,
        cutOffBeforeDays,
        cutOffTillTime,
        description,
        endReservation,
        endUsage,
        name,
        paymentTerm,
        startReservation,
        startUsage,
    } = input;

    description = description?.trim();
    name = name?.trim();

    if (isEmpty(description)) description = undefined;
    if (isEmpty(name)) name = undefined;
    if (!additionalPrice) additionalPrice = null;
    if (!startUsage) startUsage = null;
    if (!endUsage) endUsage = null;
    if (!startReservation) startReservation = null;
    if (!endReservation) endReservation = null;
    if (!cutOffBeforeDays) cutOffBeforeDays = null;
    if (!cutOffTillTime) cutOffTillTime = null;

    if ((startUsage && !endUsage) || (!startUsage && endUsage))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide both start and end usage period" });

    if (startUsage?.getTime() > endUsage?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid usage period" });

    if ((startReservation && !endReservation) || (!startReservation && endReservation))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide both start and end reservation period" });

    if (startReservation?.getTime() > endReservation?.getTime())
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid reservation period" });

    if (cutOffBeforeDays && cutOffBeforeDays < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid cut off before days" });

    if ((additionalPrice && !paymentTerm) || (!additionalPrice && paymentTerm))
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Provide both payment term and additional price" });

    if (additionalPrice && additionalPrice < 0)
        throw new GqlError({ code: "BAD_USER_INPUT", message: "Invalid addtional price" });

    return {
        id,
        additionalPrice,
        cutOffBeforeDays,
        cutOffTillTime,
        description,
        endReservation,
        endUsage,
        name,
        paymentTerm,
        startReservation,
        startUsage,
    };
}

type UpdateOptionInput = {
    id: string;
    name?: string;
    description?: string;
    startUsage?: Date;
    endUsage?: Date;
    startReservation?: Date;
    endReservation?: Date;
    cutOffBeforeDays?: number;
    cutOffTillTime?: Date;
    paymentTerm?: OptionPaymentTerm;
    additionalPrice?: number;
};

type UpdateOptionArgs = { input: UpdateOptionInput };

type UpdateOptionResult = {
    message: string;
    option?: OptionObject;
};

type UpdateOption = IFieldResolver<any, Context, UpdateOptionArgs, Promise<UpdateOptionResult>>;

const updateOption: UpdateOption = async (_, { input }, { authData, store }, info) => {
    const { accountId } = authData || {};
    if (!accountId) throw new GqlError({ code: "FORBIDDEN", message: "Invalid token!!" });

    const { id, ...data } = validateUpdateOptionInput(input);

    const option = await store.option.findUnique({ where: { id }, select: { accountId: true } });
    if (!option) throw new GqlError({ code: "NOT_FOUND", message: "Option not found" });
    if (accountId !== option.accountId)
        throw new GqlError({ code: "FORBIDDEN", message: "You are not allowed to modify this option" });

    const optionSelect = toOptionSelect(mapSelections(info)?.option)?.select;
    const updatedOption = await store.option.update({
        where: { id },
        data,
        select: optionSelect,
    });

    Log("updateOption: ", updatedOption);

    return {
        message: `Successfully updated option`,
        option: updatedOption,
    };
};

export const updateOptionTypeDefs = gql`
    input UpdateOptionInput {
        id: ID!
        name: String
        description: String
        startUsage: Date
        endUsage: Date
        startReservation: Date
        endReservation: Date
        cutOffBeforeDays: Int
        cutOffTillTime: Time
        paymentTerm: OptionPaymentTerm
        additionalPrice: Int
    }

    type UpdateOptionResult {
        message: String!
        option: OptionObject
    }

    type Mutation {
        updateOption(input: UpdateOptionInput!): UpdateOptionResult @auth(requires: [host])
    }
`;

export const updateOptionResolvers = { Mutation: { updateOption } };
