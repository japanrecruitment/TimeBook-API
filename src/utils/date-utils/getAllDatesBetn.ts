import { sortedUniq, sortedUniqBy } from "lodash";
import moment from "moment";

type Options = {
    order?: "asc" | "desc";
};

export default function getAllDatesBetn(start: Date, end: Date, options: Options = {}): Array<Date> {
    const { order } = options;
    const from = moment(start);
    const to = moment(end);
    let listOfDates: Array<Date> = [];
    for (var current = from; current <= to; current.add(1, "d")) {
        listOfDates.push(current.toDate());
    }
    listOfDates = listOfDates.sort((a, b) => {
        if (a && b) return order === "desc" ? b.getTime() - a.getTime() : a.getTime() - b.getTime();
        if (a && !b) return order === "desc" ? -1 : 1;
        if (!a && b) return order === "desc" ? 1 : -1;
        return 0;
    });
    return listOfDates;
}
