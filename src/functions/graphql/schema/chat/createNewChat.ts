import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { ApolloError, UserInputError } from "apollo-server-lambda";
import { isEmpty, intersectionBy } from "lodash";
import { Context } from "../../context";
import { ChatType } from "./ChatType";

type CreateNewChatInput = {
    message: string;
    recipientIds: string[];
};

type CreateNewChatArgs = { input: CreateNewChatInput };

type CreateNewChatResult = {
    chatId: string;
    messageId: string;
    delivered: boolean;
};

type CreateNewChat = IFieldResolver<any, Context, CreateNewChatArgs, Promise<CreateNewChatResult>>;

const createNewChat: CreateNewChat = async (_, { input }, { authData, store }) => {
    const { accountId: senderId } = authData;
    const { recipientIds } = input;
    const message = input.message?.trim();

    if (isEmpty(message)) throw new UserInputError("Empty message");

    if (!recipientIds) throw new UserInputError("Required recipients identification");

    if (recipientIds.filter((id) => id !== senderId).length <= 0)
        throw new UserInputError("Required recipients identification");

    const chatType: ChatType = recipientIds.length > 1 ? "GROUP" : "SINGLE";

    if (chatType === "SINGLE") {
        const members = await store.account.findMany({
            where: { id: { in: [senderId, recipientIds[0]] } },
            select: { chats: { where: { type: "SINGLE" }, select: { id: true } } },
        });

        Log(members);

        if (members.length < 2) throw new ApolloError("Invalid identification");

        const commonChats = intersectionBy(members[0].chats, members[1].chats, "id");

        if (commonChats.length > 1)
            throw new ApolloError("Multiple single chat with the same members found. Please contact support");

        const chatId = commonChats.length === 1 && commonChats[0].id;

        if (chatId) {
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
        }
    }

    const newChat = await store.chat.create({
        data: {
            type: chatType,
            members: {
                connect: recipientIds.map((id) => ({ id })).concat({ id: senderId }),
            },
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

    Log(newChat);

    return {
        chatId: newChat.id,
        messageId: newChat.messages[0].id,
        delivered: true,
    };
};

export const createNewChatTypeDef = gql`
    input CreateNewChatInput {
        message: String!
        recipientIds: [ID]!
    }

    type CreateNewChatResult {
        chatId: ID!
        messageId: ID!
        delivered: Boolean!
    }

    type Mutation {
        createNewChat(input: CreateNewChatInput!): CreateNewChatResult @auth(requires: [user, host])
    }
`;

export const createNewChatResolver = { Mutation: { createNewChat } };
