import { gql } from "apollo-server-core";
import { differenceWith, uniqWith } from "lodash";
import { GqlError } from "src/functions/graphql/error";

export function validateUpdateBasicPriceSettingInput(
    input: UpdateBasicPriceSettingInput
): UpdateBasicPriceSettingInput {
    let { id, priceSchemeId } = input;
    return { id, priceSchemeId };
}

export function validateUpdateBasicPriceSettingInputList(
    input: UpdateBasicPriceSettingInput[]
): UpdateBasicPriceSettingInput[] {
    const distinctInput = uniqWith(input, (a, b) => a.id === b.id);
    differenceWith(input, distinctInput, (a, b) => a.id === b.id).forEach(({ id }) => {
        throw new GqlError({
            code: "BAD_USER_INPUT",
            message: `Repeated input with same id ${id} provided`,
        });
    });

    return distinctInput.map(validateUpdateBasicPriceSettingInput);
}

export type UpdateBasicPriceSettingInput = {
    id: string;
    priceSchemeId: string;
};

export const updateBasicPriceSettingTypeDefs = gql`
    input UpdateBasicPriceSettingInput {
        id: ID!
        priceSchemeId: ID!
    }
`;

export const updateBasicPriceSettingResolvers = {};
