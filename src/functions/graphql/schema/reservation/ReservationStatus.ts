import { ReservationStatus } from "@prisma/client";
import { gql } from "apollo-server-core";

export const reservationStatusTypeDef = gql`
    enum ReservationStatus {
        RESERVED
        HOLD
        PENDING
        FAILED
        DISAPPROVED
    }
`;

export const reservationStatusResolver = { ReservationStatus };
