import axios from "axios";
// import Required Models
import { IpDetailModel as IpDetail } from "../model";

const { IP_STACK_KEY } = process.env;

const callIpStacks = async (ipAddress) => {
    try {
        const URL = `http://api.ipstack.com/${ipAddress}?access_key=${IP_STACK_KEY}`;
        const response = await axios.get(URL);
        if (response.status === 200) {
            return Promise.resolve(response.data);
        }
        return Promise.resolve(null);
    } catch (error) {
        console.log("error occurred at libs/ipStacks.ts/ipStacks");
        return Promise.resolve(null);
    }
};

const getIpData = async (ip) => {
    try {
        let ipDetail = await IpDetail.findOne({ ip });
        if (ipDetail) return Promise.resolve(ipDetail.detail);

        // ipDetail not found in DB so fetch from ipStacks
        const newIpDetail = await callIpStacks(ip);
        if (newIpDetail) {
            const newIpRecord = new IpDetail({
                ip: ip,
                detail: newIpDetail,
            });
            await newIpRecord.save();
            return Promise.resolve(newIpDetail);
        }
        return Promise.resolve(null);
    } catch (error) {
        console.log("error at libs/ipStacks.ts/getIpData", error);
        return Promise.resolve(null);
    }
};

export const IpStacks = { getIpData };
