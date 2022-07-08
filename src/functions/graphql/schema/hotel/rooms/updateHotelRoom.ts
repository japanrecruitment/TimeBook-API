import { gql } from "apollo-server-core";

export const updateHotelRoomTypeDefs = gql`
    input UpdateHotelRoomInput {
        id: ID!
        name: String
        description: String
        paymentTerm: HotelPaymentTerm
        maxCapacityAdult: Int
        maxCapacityChild: Int
        stock: Int
    }
`;
