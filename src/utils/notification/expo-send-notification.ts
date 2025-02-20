import Expo from "expo-server-sdk";
import { environment } from "..";
import { Log } from "../logger";

const expo = new Expo({ accessToken: environment.EXPO_ACCESS_TOKEN });

type NotificationObject<T = any> = {
    tokens: string[];
    body: string;
    data?: T;
};

export function expoSendNotification(notifications: NotificationObject[]) {
    // Create the messages that you want to send to clients
    let messages = [];
    for (let { body, tokens, data } of notifications) {
        // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]

        for (let token of tokens) {
            // Check that all your push tokens appear to be valid Expo push tokens
            const expoToken = `ExponentPushToken[${token}]`;

            if (!Expo.isExpoPushToken(expoToken)) {
                Log(`Push token ${expoToken} is not a valid Expo push token`);
                continue;
            }

            // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
            messages.push({
                to: expoToken ,
                sound: "default",
                body,
                data,
            });
        }
    }

    // The Expo push notification service accepts batches of notifications so
    // that you don't need to send 1000 requests to send 1000 notifications. We
    // recommend you batch your notifications to reduce the number of requests
    // and to compress them (notifications with similar content will get
    // compressed).
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    (async () => {
        // Send the chunks to the Expo push notification service. There are
        // different strategies you could use. A simple one is to send one chunk at a
        // time, which nicely spreads the load out over time:
        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                Log(ticketChunk);
                tickets.push(...ticketChunk);
                // NOTE: If a ticket contains an error code in ticket.details.error, you
                // must handle it appropriately. The error codes are listed in the Expo
                // documentation:
                // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
                Log(error);
            }
        }
    })();
}
