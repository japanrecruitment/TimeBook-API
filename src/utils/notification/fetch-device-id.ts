import moment from "moment";
import { store } from "../store";

export async function fetchDeviceId(accountIds: string[]): Promise<Array<string>> {
    const sessions = await store.session.findMany({
        where: { accountId: { in: accountIds }, updatedAt: { gte: moment().subtract(1, "M").toDate() } },
        select: { deviceID: true },
    });

    return sessions.map(({ deviceID }) => deviceID);
}
