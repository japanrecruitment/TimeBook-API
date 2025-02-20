import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { GqlError } from "../../error";
import { PaginationOption } from "../core/pagination";
import { MessageObject, toMessageSelect } from "./MessageObject";

type MessagesByChatArgs = { chatId: string; paginate?: PaginationOption };

type MessagesByChatResult = Partial<MessageObject>[];

type MessagesByChat = IFieldResolver<any, Context, MessagesByChatArgs, Promise<MessagesByChatResult>>;

const messagesByChat: MessagesByChat = async (_, { chatId, paginate }, { authData, store }, info) => {
    const { accountId } = authData;
    const { take, after } = paginate || { take: 10 };

    const chat = await store.chat.findUnique({
        where: { id: chatId },
        select: {
            members: { select: { id: true } },
            messages: {
                ...toMessageSelect(mapSelections(info)),
                take,
                cursor: after && typeof after === "string" ? { id: after } : undefined,
                orderBy: { updatedAt: "desc" },
            },
        },
    });

    if (!chat.members.map(({ id }) => id).includes(accountId))
        throw new GqlError({ code: "UNAUTHORIZED", message: "無効なリクエスト" });

    Log(chat.messages);

    return chat.messages;
};

export const messagesByChatTypeDef = gql`
    type Query {
        messagesByChat(chatId: ID!, paginate: PaginationOption): [MessageObject] @auth(requires: [user, host])
    }
`;

export const messagesByChatResolver = { Query: { messagesByChat } };
