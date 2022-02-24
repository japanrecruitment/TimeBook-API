import moment from "moment";

export default function getDaysOfWeekIncludedBetn(start: Date, end: Date): Array<number> {
    const from = moment(start);
    const to = moment(end);
    let listOfDays: Array<number> = [];
    for (var current = from; current <= to; current.add(1, "d")) {
        listOfDays.push(current.weekday());
    }
    listOfDays = listOfDays.filter((d) => d < 7).sort();
    listOfDays = listOfDays.filter((c, index) => listOfDays.indexOf(c) === index);
    return listOfDays;
}
