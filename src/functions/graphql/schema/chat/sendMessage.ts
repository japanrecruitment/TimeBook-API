import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { UserInputError } from "apollo-server-lambda";
import { isEmpty } from "lodash";
import { Context } from "../../context";

type SendMessageInput = {
    message: string;
    chatId: string;
};

type SendMessageArgs = { input: SendMessageInput };

type SendMessageResult = {
    chatId: string;
    messageId: string;
    delivered: boolean;
};

type SendMessage = IFieldResolver<any, Context, SendMessageArgs, Promise<SendMessageResult>>;

const sendMessage: SendMessage = async (_, { input }, { authData, store }) => {
    const { accountId: senderId } = authData;
    const { chatId } = input;
    const message = input.message?.trim();

    if (isEmpty(message)) throw new UserInputError("Empty message");

    if (!chatId) throw new UserInputError("Required chat identification");

    const chat = await store.chat.findUnique({ where: { id: chatId } });

    if (!chat) throw new UserInputError("Invalid chat identification");

    const updatedChat = await store.chat.update({
        where: { id: chatId },
        data: {
            messages: {
                create: { sender: { connect: { id: senderId } }, message },
            },
            updatedAt: new Date(),
        },
        select: {
            id: true,
            messages: {
                where: { message: { equals: message } },
                select: { id: true },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    Log(updatedChat);

    return {
        chatId: updatedChat.id,
        messageId: updatedChat.messages[0].id,
        delivered: true,
    };
};

export const sendMessageTypeDef = gql`
    input SendMessageInput {
        message: String!
        chatId: ID!
    }

    type SendMessageResult {
        chatId: ID!
        messageId: ID!
        delivered: Boolean!
    }

    type Mutation {
        sendMessage(input: SendMessageInput!): SendMessageResult @auth(requires: [user, host])
    }
`;

export const sendMessageResolver = { Mutation: { sendMessage } };
