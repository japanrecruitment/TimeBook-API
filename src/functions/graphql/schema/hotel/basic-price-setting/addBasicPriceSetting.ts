import { gql } from "apollo-server-core";
import { GqlError } from "src/functions/graphql/error";

export function validateAddBasicPriceSettingInput(input: AddBasicPriceSettingInput): AddBasicPriceSettingInput {
    let { dayOfWeek, priceSchemeId } = input;

    if (dayOfWeek < 0 || dayOfWeek > 6) throw new GqlError({ code: "BAD_USER_INPUT", message: "無効な曜日" });

    return { dayOfWeek, priceSchemeId };
}

export function validateAddBasicPriceSettingInputList(input: AddBasicPriceSettingInput[]): AddBasicPriceSettingInput[] {
    input.forEach((setting, index) => {
        const hasDuplicateSetting = input.slice(index + 1).some((s) => s.dayOfWeek === setting.dayOfWeek);
        if (hasDuplicateSetting)
            throw new GqlError({
                code: "BAD_USER_INPUT",
                message: "同じ曜日の繰り返し入力が見つかりました",
            });
    });

    const receivedInput = input.map(validateAddBasicPriceSettingInput);

    return [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
        dayOfWeek,
        priceSchemeId: receivedInput.find((setting) => dayOfWeek === setting.dayOfWeek)?.priceSchemeId,
    }));
}

export type AddBasicPriceSettingInput = {
    dayOfWeek: number;
    priceSchemeId: string;
};

export const addBasicPriceSettingTypeDefs = gql`
    input AddBasicPriceSettingInput {
        dayOfWeek: Int!
        priceSchemeId: ID!
    }
`;

export const addBasicPriceSettingResolvers = {};
