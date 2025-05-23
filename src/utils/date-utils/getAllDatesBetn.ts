import { sortedUniq, sortedUniqBy } from "lodash";
import moment from "moment";

type Options = {
    order?: "asc" | "desc";
};

export default function getAllDatesBetn(start: Date, end: Date, options: Options = {}): Array<Date> {
    const { order } = options;
    const from = moment(start).startOf('day'); // Normalize to start of day
    const to = moment(end).startOf('day');     // Normalize to start of day
    let listOfDates: Array<Date> = [];
    
    // Clone the moment object to avoid mutation issues
    let current = from.clone();
    while (current.isSameOrBefore(to)) {
        listOfDates.push(current.toDate());
        current = current.clone().add(1, 'd'); // Clone before adding
    }
    
    listOfDates = listOfDates.sort((a, b) => {
        if (a && b) return order === "desc" ? b.getTime() - a.getTime() : a.getTime() - b.getTime();
        if (a && !b) return order === "desc" ? -1 : 1;
        if (!a && b) return order === "desc" ? 1 : -1;
        return 0;
    });
    return listOfDates;
}