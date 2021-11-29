import { environment } from "@utils/environment";
import { RequestOptions, RESTDataSource } from "apollo-datasource-rest";

export class GoogleMapDataSource extends RESTDataSource {
    apiKey = environment.GOOGLE_MAP_API_KEY;
    outputFormat = "json";
    constructor() {
        super();
        this.baseURL = `https://maps.googleapis.com/maps/api/geocode/${this.outputFormat}`;
    }

    async geocode() {}
}
