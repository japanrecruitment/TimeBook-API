import { Log } from "@utils/logger";
import { store } from "@utils/store";

export default async (ipAddress: string) => {
    try {
        Log("[STARTED]: Fetching ip data from DB", ipAddress);
        const ipData = await store.ipData.findFirst({
            where: { ipAddress },
            select: {
                ipAddress: true,
                city: true,
                country: true,
                countryCode: true,
                data: true,
            },
        });
        Log(`[${ipData ? `COMPLETED` : `FAILED`}]: Fetching ip data from DB`, ipData);
        return ipData;
    } catch (error) {
        Log("[Failed]: Fetching ip data from DB", error);
    }
};
