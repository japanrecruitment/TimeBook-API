import * as moment from "moment";

export interface DateRange {
    from: moment.Moment;
    to: moment.Moment;
}

export const dateRangesOverlap = (rangeA: DateRange, rangeB: DateRange): boolean => {
    return (
        (rangeA.from.isSameOrBefore(rangeB.to) && rangeA.to.isSameOrAfter(rangeB.from)) ||
        (rangeB.from.isSameOrBefore(rangeA.to) && rangeB.to.isSameOrAfter(rangeA.from))
    );
};
