import { gql } from "apollo-server-core";

export type SpaceSettingFilterOptions = {
    fromDate: Date;
    toDate: Date;
};

export const spaceSettingFilterOptionsTypeDefs = gql`
    input SpaceSettingFilterOptions {
        fromDate: Date
        toDate: Date
    }
`;
