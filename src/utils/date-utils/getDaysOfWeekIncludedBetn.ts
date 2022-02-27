import { sortedUniq } from "lodash";
import moment from "moment";

export default function getDaysOfWeekIncludedBetn(start: Date, end: Date): Array<number> {
    const from = moment(start);
    const to = moment(end);
    let listOfDays: Array<number> = [];
    for (var current = from; current <= to; current.add(1, "d")) {
        listOfDays.push(current.weekday());
    }
    listOfDays = sortedUniq(listOfDays.filter((d) => d < 7));
    return listOfDays;
}
