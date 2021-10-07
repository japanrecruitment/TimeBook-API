import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { MessageObject, toMessageSelect } from "./MessageObject";

type MessagesByChatArgs = { chatId: string };

type MessagesByChatResult = Partial<MessageObject>[];

type MessagesByChat = IFieldResolver<any, Context, MessagesByChatArgs, Promise<MessagesByChatResult>>;

const messagesByChat: MessagesByChat = async (_, { chatId }, { authData, store }, info) => {
    const { accountId } = authData;

    const chat = await store.chat.findUnique({
        where: { id: chatId },
        select: {
            members: { select: { id: true } },
            messages: { ...toMessageSelect(mapSelections(info)) },
        },
    });

    if (!chat.members.map(({ id }) => id).includes(accountId))
        throw new GqlError({ code: "UNAUTHORIZED", message: "You do not have access to this chat" });

    Log(chat.messages);

    return chat.messages;
};

export const messagesByChatTypeDef = gql`
    type Query {
        messagesByChat(chatId: ID!): [MessageObject] @auth(requires: [user, host])
    }
`;

export const messagesByChatResolver = { Query: { messagesByChat } };
