import { omit, pick } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty, merge } from "lodash";
import { ProfileObject, ProfileSelect, toProfileSelect } from "../account/profile";
import { ChatType } from "./ChatType";
import { MessageObject, MessageSelect, toMessageSelect } from "./MessageObject";

export type ChatObject = {
    id: string;
    type: ChatType;
    members: Partial<ProfileObject>[];
    messages: Partial<MessageObject>[];
};

export type ChatSelect = {
    id: boolean;
    type: boolean;
    members: PrismaSelect<ProfileSelect>;
    messages: PrismaSelect<MessageSelect>;
};

export const toChatSelect = (selections, defaultValue: any = false): PrismaSelect<ChatSelect> => {
    if (!selections) return defaultValue;
    const membersSelect = toProfileSelect(selections.members);
    const messagesSelect = toMessageSelect(selections.messages);
    const chatSelect = pick(selections, "id", "type", "createdAt", "updatedAt");
    if (isEmpty(membersSelect) && isEmpty(messagesSelect) && isEmpty(chatSelect)) return defaultValue;
    return {
        select: {
            ...chatSelect,
            members: membersSelect,
            messages: messagesSelect,
        },
    };
};

export const chatObjectTypeDef = gql`
    type ChatObject {
        id: ID
        type: ChatType
        members: [Profile]
        messages: [MessageObject]
        createdAt: Date
        updatedAt: Date
    }
`;

export const chatObjectResolver = {
    ChatObject: {
        members: ({ members }) => {
            return members?.map((account) => {
                return merge(
                    omit(account, "userProfile", "companyProfile"),
                    { accountId: account.id },
                    account.userProfile || account.companyProfile
                );
            });
        },
    },
};
