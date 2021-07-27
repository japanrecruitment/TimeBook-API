import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import axios from "axios";

export default async (ipAddress: string) => {
    try {
        Log("[STARTED]: Fetching ip data from IpStack", ipAddress);
        const url = `http://api.ipstack.com/${ipAddress}?access_key=${environment.IP_STACK_KEY}`;
        const response = await axios.get(url);
        if (response.status === 200) {
            const { city, country_code, country_name, ...data } = response.data;
            const ipData = {
                ipAddress,
                city,
                countryCode: country_code,
                country: country_name,
                data,
            };
            Log("[COMPLETED]: Fetching ip data from IpStack", ipData);
            return ipData;
        }
        Log("[FAILED]: Fetching ip data from IpStack", ipAddress);
        return { ipAddress };
    } catch (error) {
        Log("[FAILED]: fetching ip data from IpStack", error);
        return { ipAddress };
    }
};
