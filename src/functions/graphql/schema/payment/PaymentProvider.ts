import { PaymentProvider } from "@prisma/client";
import { gql } from "apollo-server-core";

export const paymentProviderTypeDef = gql`
    enum PaymentProvider {
        STRIPE
    }
`;

export const paymentProviderResolver = { PaymentProvider };
