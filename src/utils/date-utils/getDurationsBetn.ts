import moment from "moment";

type Durations = { days?: number; hours?: number; minutes?: number };

export default function getDurationsBetn(start: Date, end: Date): Durations {
    const from = moment(start);
    const to = moment(end);

    const totalMinutes = moment.duration(to.diff(from)).asMinutes(); 
    let days = Math.floor(totalMinutes / (24 * 60)); 
    const remainingMinutesAfterDays = totalMinutes % (24 * 60); 
    let hours = Math.floor(remainingMinutesAfterDays / 60); 
    let minutes = Math.round(remainingMinutesAfterDays % 60); 
    if (minutes === 60) {
        hours += 1;
        minutes = 0;
    }
    if (hours === 24) {
        days += 1;
        hours = 0;
    }

    return { days, hours, minutes };
}
