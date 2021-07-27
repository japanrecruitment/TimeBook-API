import fetchIpDataFromDB from "./fetchIpDataFromDB";
import fetchIpDataFromIpStack from "./fetchIpDataFromIpStack";

export default async (ipAddress: string) => {
    let ipData = await fetchIpDataFromDB(ipAddress);
    if (ipData) return ipData;
    return await fetchIpDataFromIpStack(ipAddress);
};
