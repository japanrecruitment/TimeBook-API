import moment from "moment";

export default function getDurationsBetn(start: Date, end: Date) {
    const from = moment(start);
    const to = moment(end);

    const dayDiff = moment.duration(to.diff(from)).asDays();
    const days = Math.floor(dayDiff);
    const remainingHrs = (dayDiff - days) * 24;
    const hours = Math.floor(remainingHrs);
    const remainingMinutes = (remainingHrs - hours) * 60;
    const minutes = Math.ceil(remainingMinutes);

    return { days, hours, minutes };
}
