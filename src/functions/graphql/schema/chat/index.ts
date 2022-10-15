import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { chatObjectResolver, chatObjectTypeDef } from "./ChatObject";
import { chatTypeResolver, chatTypeTypeDef } from "./ChatType";
import { createNewChatResolver, createNewChatTypeDef } from "./createNewChat";
import { messageObjectResolver, messageObjectTypeDef } from "./MessageObject";
import { messagesByChatResolver, messagesByChatTypeDef } from "./messagesByChat";
import { myChatsResolver, myChatsTypeDef } from "./myChats";
import { sendMessageResolver, sendMessageTypeDef } from "./sendMessage";

export const typeDefs = mergeTypeDefs([
    chatTypeTypeDef,
    chatObjectTypeDef,
    createNewChatTypeDef,
    messageObjectTypeDef,
    myChatsTypeDef,
    sendMessageTypeDef,
    messagesByChatTypeDef,
]);

export const resolvers = mergeResolvers([
    chatTypeResolver,
    chatObjectResolver,
    createNewChatResolver,
    messageObjectResolver,
    myChatsResolver,
    sendMessageResolver,
    messagesByChatResolver,
]);
