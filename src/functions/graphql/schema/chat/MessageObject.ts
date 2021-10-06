import { omit, pick } from "@utils/object-helper";
import { gql } from "apollo-server-core";
import { PrismaSelect } from "graphql-map-selections";
import { isEmpty, merge } from "lodash";
import { ProfileObject, ProfileSelect, toProfileSelect } from "../account/profile";

export type MessageObject = {
    id: string;
    message: string;
    sender: Partial<ProfileObject>;
};

export type MessageSelect = {
    id: boolean;
    message: boolean;
    sender: PrismaSelect<ProfileSelect>;
};

export const toMessageSelect = (selections, defaultValue: any = false): PrismaSelect<MessageSelect> => {
    if (!selections) return defaultValue;
    const senderSelect = toProfileSelect(selections.sender);
    const messageSelect = pick(selections, "id", "message", "createdAt", "updatedAt");
    if (isEmpty(messageSelect) && isEmpty(senderSelect)) return defaultValue;
    return {
        select: {
            ...messageSelect,
            sender: senderSelect,
        },
    };
};

export const messageObjectTypeDef = gql`
    type MessageObject {
        id: ID
        message: String
        sender: Profile
        createdAt: Date
        updatedAt: Date
    }
`;

export const messageObjectResolver = {
    MessageObject: {
        sender: ({ sender }) => {
            if (isEmpty(sender)) return;
            return merge(
                omit(sender, "userProfile", "companyProfile"),
                { accountId: sender.id },
                sender.userProfile || sender.companyProfile
            );
        },
    },
};
