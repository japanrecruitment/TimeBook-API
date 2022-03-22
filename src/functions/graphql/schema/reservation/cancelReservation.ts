import { IFieldResolver } from "@graphql-tools/utils";
import { gql } from "apollo-server-core";
import { Context } from "../../context";
import { Result } from "../core/result";

type CancelReservationArgs = {
    reservationId: string;
};

type CancelReservationResult = Promise<Result>;

type CancelReservation = IFieldResolver<any, Context, CancelReservationArgs, CancelReservationResult>;

const cancelReservation: CancelReservation = async () => {
    return { message: "Successfully canceled reservation." };
};

export const cancelReservationTypeDefs = gql`
    type Mutation {
        cancelReservation(reservationId: ID!): Result @auth(requires: [user, host])
    }
`;

export const cancelReservationResolvers = {
    Mutation: { cancelReservation },
};
