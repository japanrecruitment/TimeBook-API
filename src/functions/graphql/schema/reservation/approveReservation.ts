import { IFieldResolver } from "@graphql-tools/utils";
import { StripeLib } from "@libs/index";
import { gql } from "apollo-server-core";
import { Context } from "../../context";

type ApproveReservationArgs = {
    reservationId: string;
};

type ApproveReservation = IFieldResolver<any, Context, any, any>;

const approveReservation: ApproveReservation = async () => {};

export const approveReservationTypeDefs = gql`
    type Mutation {
        approveReservation(reservationId: ID!): Result @auth(requires: [host])
    }
`;

export const apporveReservationResolvers = {
    Mutation: { approveReservation },
};
