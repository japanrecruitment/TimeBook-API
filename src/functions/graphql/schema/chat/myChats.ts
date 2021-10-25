import { IFieldResolver } from "@graphql-tools/utils";
import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { mapSelections } from "graphql-map-selections";
import { Context } from "../../context";
import { ChatObject, toChatSelect } from "./ChatObject";

type MyChatsResult = Partial<ChatObject>[];

type MyChats = IFieldResolver<any, Context, any, Promise<MyChatsResult>>;

const myChats: MyChats = async (_, __, { authData, store }, info) => {
    const { accountId } = authData;
    const account = await store.account.findUnique({
        where: { id: accountId },
        select: {
            chats: {
                orderBy: { updatedAt: "desc" },
                ...toChatSelect(mapSelections(info)),
            },
        },
    });

    Log(account.chats);

    return account.chats;
};

export const myChatsTypeDef = gql`
    type Query {
        myChats: [ChatObject] @auth(requires: [user, host])
    }
`;

export const myChatsResolver = { Query: { myChats } };
