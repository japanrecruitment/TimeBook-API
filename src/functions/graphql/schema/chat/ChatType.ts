import { ChatType as TChatType } from "@prisma/client";
import { gql } from "apollo-server-core";

export type ChatType = TChatType;

export const chatTypeTypeDef = gql`
  enum ChatType {
    SINGLE
    GROUP
  }
`;

export const chatTypeResolver = { ChatType: TChatType };
