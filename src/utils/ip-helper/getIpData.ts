import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import axios from "axios";

export default async (ipAddress: string) => {
    try {
        console.log("[STARTED]: fetching ip data");
        const url = `http://api.ipstack.com/${ipAddress}?access_key=${environment.IP_STACK_KEY}`;
        const response = await axios.get(url);
        // Log(response);
        if (response.status === 200) return response.data;
    } catch (error) {
        console.log("[FAILED]: fetching ip data");
    }
};
