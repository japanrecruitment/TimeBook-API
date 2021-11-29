import { environment } from "@utils/environment";
import { Log } from "@utils/logger";
import { RequestOptions, RESTDataSource } from "apollo-datasource-rest";

export class GoogleMapDataSource extends RESTDataSource {
    private apiKey = environment.GOOGLE_MAP_API_KEY;
    private outputFormat = "json";
    private language = "ja";
    private region = "JP";

    constructor() {
        super();
        this.baseURL = `https://maps.googleapis.com/maps/api`;
    }

    willSendRequest(request: RequestOptions) {
        Log(request);
    }

    async getLatLng(prefecture: string, city: string, addressLine: string): Promise<{ lat: number; lng: number }> {
        try {
            Log("[STARTED]: fetching latitude and longitude.", prefecture, city, addressLine);
            const response = await this.get(`/geocode/${this.outputFormat}`, {
                address: prefecture + city + addressLine,
                key: this.apiKey,
                language: this.language,
                region: this.region,
            });
            if (response && response.status === "OK") {
                Log("[COMPLETED]: fetching latitude and longitude.", response);
                const location = response.results[0].geometry.location;
                return location;
            }
            Log("[FAILED]: fetching latitude and longitude.", response);
        } catch (error) {
            Log("[FAILED]: fetching latitude and longitude.", error);
        }
    }
}
