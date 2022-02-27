import moment from "moment";

type Durations = { days?: number; hours?: number; minutes?: number };

export default function getDurationsBetn(start: Date, end: Date): Durations {
    const from = moment(start);
    const to = moment(end);

    const dayDiff = moment.duration(to.diff(from)).asDays();
    const days = Math.floor(dayDiff < 0 ? 0 : dayDiff);
    const remainingHrs = (dayDiff - days) * 24;
    const hours = Math.floor(remainingHrs < 0 ? 0 : remainingHrs);
    const remainingMinutes = (remainingHrs - hours) * 60;
    const minutes = Math.round(remainingMinutes < 0 ? 0 : remainingMinutes);

    return { days, hours, minutes };
}
