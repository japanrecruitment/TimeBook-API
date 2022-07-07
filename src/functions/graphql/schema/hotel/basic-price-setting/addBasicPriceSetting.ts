import { gql } from "apollo-server-core";

export type AddBasicPriceSettingInput = {
    sunday: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thrusday: string;
    friday: string;
    saturday: string;
};

export const addBasicPriceSettingTypeDefs = gql`
    input AddBasicPriceSettingInput {
        sunday: ID
        monday: ID
        tuesday: ID
        wednesday: ID
        thrusday: ID
        friday: ID
        saturday: ID
    }
`;

export const addBasicPriceSettingResolvers = {};
