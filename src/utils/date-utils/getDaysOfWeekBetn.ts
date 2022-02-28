import { sortedUniq } from "lodash";
import moment from "moment";

type Options = {
    distinct?: boolean;
    order?: "asc" | "desc";
};

export default function getDaysOfWeekBetn(start: Date, end: Date, options?: Options): Array<number> {
    const from = moment(start);
    const to = moment(end);
    let listOfDays: Array<number> = [];
    for (var current = from; current <= to; current.add(1, "d")) {
        listOfDays.push(current.weekday());
    }
    if (options.distinct) listOfDays = sortedUniq(listOfDays.filter((d) => d < 7));
    else listOfDays = listOfDays.filter((d) => d < 7).sort();
    if (options.order && options.order === "desc") listOfDays = listOfDays.reverse();
    return listOfDays;
}
