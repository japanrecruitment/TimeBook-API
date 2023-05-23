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
    createdAt: boolean;
    updatedAt: boolean;
};

export const toChatSelect = (selections, defaultValue: any = false) => {
    if (!selections) return defaultValue;
    const membersSelect = toProfileSelect(selections.members);
    const messagesSelect = toMessageSelect(selections.messages);
    const chatSelect = pick(selections, "id", "type", "createdAt", "updatedAt");
    if (isEmpty(membersSelect) && isEmpty(messagesSelect) && isEmpty(chatSelect)) return defaultValue;
    return {
        select: {
            ...chatSelect,
            members: membersSelect,
            messages: { ...messagesSelect, take: 10, orderBy: { updatedAt: "desc" } },
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
                const preppedAccount = merge(
                    omit(account, "userProfile", "companyProfile"),
                    { accountId: account.id },
                    account.userProfile || account.companyProfile
                );
                console.log("UserProfile", account.userProfile, "CompanyProfile", account.companyProfile);
                console.log("PREPPED", preppedAccount);
                return preppedAccount;
            });
        },
    },
};
