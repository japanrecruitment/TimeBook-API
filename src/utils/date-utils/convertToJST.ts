import moment from "moment";
import { Log } from "..";

export default function convertToJST(date: Date) {
    const d = moment(date).utcOffset(9).toDate();
    Log(d, d.getTimezoneOffset());
    return d;
}
