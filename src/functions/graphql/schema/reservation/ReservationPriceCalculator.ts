import { SpacePricePlan, SpacePricePlanType } from "@prisma/client";
import { getDurationsBetn } from "../../../../utils/date-utils";
import { omit } from "../../../../utils/object-helper";
import { concat, isEmpty, merge } from "lodash";
import moment from "moment";
import { SpacePricePlanObject } from "../space/space-price-plans";

type ReservationPriceCalculatorConstructorArgs = {
    checkIn: Date;
    checkOut: Date;
    pricePlans: SpacePricePlanObject[];
};

export default class ReservationPriceCalculator {
    private _checkIn: Date;
    private _checkOut: Date;
    private _pricePlans: Partial<SpacePricePlan>[];
    private dumpedMinutes: number = 0;
    readonly price: number = 0;

    constructor(args: ReservationPriceCalculatorConstructorArgs) {
        const { checkIn, checkOut, pricePlans } = args;
        this._checkIn = checkIn;
        this._checkOut = checkOut;
        this._pricePlans = concat(
            pricePlans.map((p) => omit(p, "overrides")),
            pricePlans
                .flatMap((p) => p.overrides?.map((o) => merge(o, { type: p.type, duration: p.duration })))
                .filter((p) => p)
        );
        this.price = this.calculatePrice(checkIn, checkOut, this._pricePlans) + this.calculatePriceOfDumpedMinutes();
    }

    private calculatePrice(from: Date, to: Date, plans: Partial<SpacePricePlan>[]) {
        const mDurations = getDurationsBetn(from, to);

        const days = () => mDurations.days;
        const hours = () => mDurations.hours;
        const minutes = () => mDurations.minutes;
        const mStartMs = () => from.getTime();
        const mEndMs = () => to.getTime();
        let mPrice: number = 0;

        const dailyPlans = days() > 0 ? this.filterAndSortPlans(plans, "DAILY", days()) : [];
        if (days() > 0 && isEmpty(dailyPlans)) mDurations.hours = hours() + days() * 24;
        const hourlyPlans = hours() > 0 ? this.filterAndSortPlans(plans, "HOURLY", hours()) : [];
        if (hours() > 0 && isEmpty(hourlyPlans)) mDurations.minutes = minutes() + hours() * 60;
        const minutesPlans = minutes() > 0 ? this.filterAndSortPlans(plans, "MINUTES", minutes()) : [];

        const mPlans: Partial<SpacePricePlan>[] = concat(dailyPlans, hourlyPlans, minutesPlans);
        if (isEmpty(mPlans)) {
            this.dumpedMinutes = this.dumpedMinutes + minutes();
            return mPrice;
        }

        console.log(from, to, mDurations);
        console.log(mPlans);

        for (let i = 0; i < mPlans.length; i++) {
            const { amount, duration, fromDate, toDate, type } = mPlans[i];
            const unit = type === "DAILY" ? "days" : type === "HOURLY" ? "hours" : "minutes";
            if (fromDate && toDate) {
                const startMs = fromDate.getTime();
                const endMs = toDate.getTime();
                if (startMs >= mStartMs() && startMs <= mEndMs() && endMs > mEndMs()) {
                    const uDuration = getDurationsBetn(fromDate, to)[unit];
                    if (uDuration >= duration) {
                        let remPrice = this.calculatePrice(from, moment(to).subtract(duration, unit).toDate(), plans);
                        mPrice = mPrice + amount + remPrice;
                        break;
                    }
                } else if (startMs >= mStartMs() && startMs <= mEndMs() && endMs >= mStartMs() && endMs <= mEndMs()) {
                    const uDuration = getDurationsBetn(fromDate, toDate)[unit];
                    if (uDuration >= duration) {
                        let remPrice1 = this.calculatePrice(toDate, to, plans);
                        let remPrice2 = this.calculatePrice(
                            from,
                            moment(toDate).subtract(duration, unit).toDate(),
                            plans
                        );
                        mPrice = mPrice + amount + remPrice1 + remPrice2;
                        break;
                    }
                } else if (endMs >= mStartMs() && endMs <= mEndMs() && startMs < mStartMs()) {
                    const uDuration = getDurationsBetn(from, toDate)[unit];
                    if (uDuration >= duration) {
                        let remPrice1 = this.calculatePrice(toDate, to, plans);
                        let remPrice2 = this.calculatePrice(
                            from,
                            moment(toDate).subtract(duration, unit).toDate(),
                            plans
                        );
                        mPrice = mPrice + amount + remPrice1 + remPrice2;
                        break;
                    }
                }
            } else {
                while (mDurations[unit] >= duration) {
                    mPrice = mPrice + amount;
                    mDurations[unit] = mDurations[unit] - duration;
                }
            }
        }

        console.log("return:price:", mPrice);

        return mPrice;
    }

    private calculatePriceOfDumpedMinutes() {
        let daysDiff = this.dumpedMinutes / (24 * 60);
        let days = Math.floor(daysDiff < 0 ? 0 : daysDiff);
        let hoursDiff = (daysDiff - days) * 24;
        let hours = Math.floor(hoursDiff < 0 ? 0 : hoursDiff);
        let minutesDiff = (hoursDiff - hours) * 60;
        let minutes = Math.round(minutesDiff < 0 ? 0 : minutesDiff);
        let mPrice: number = 0;
        const plans = this._pricePlans.filter(({ isDefault, toDate }) => isDefault || toDate === null);

        const dailyPlans = days > 0 ? this.filterAndSortPlans(plans, "DAILY", days) : [];
        if (days > 0 && isEmpty(dailyPlans)) hours = hours + days * 24;
        const hourlyPlans = hours > 0 ? this.filterAndSortPlans(plans, "HOURLY", hours) : [];
        if (hours > 0 && isEmpty(hourlyPlans)) minutes = minutes + hours * 60;
        const minutesPlans = minutes > 0 ? this.filterAndSortPlans(plans, "MINUTES", minutes) : [];

        for (let i = 0; i < dailyPlans.length; i++) {
            const { amount, duration } = dailyPlans[i];
            if (days >= duration) {
                mPrice = mPrice + amount;
                days = days - duration;
            }
        }

        if (days > 0) hours = hours + days * 24;
        for (let i = 0; i < hourlyPlans.length; i++) {
            const { amount, duration } = hourlyPlans[i];
            if (hours >= duration) {
                mPrice = mPrice + amount;
                hours = hours - duration;
            }
        }

        if (hours > 0) minutes = minutes + hours * 24;
        for (let i = 0; i < minutesPlans.length; i++) {
            const { amount, duration } = minutesPlans[i];
            if (minutes >= duration) {
                mPrice = mPrice + amount;
                minutes = minutes - duration;
            }
        }

        if (minutes > 0) {
            const iPlans = plans.filter(({ type }) => type === "MINUTES").sort((a, b) => b.duration - a.duration);
            const hPlans = iPlans.filter(({ duration }) => duration >= minutes);
            const lPlans = iPlans.filter(({ duration }) => duration <= minutes);
            const plan = hPlans.length > 0 ? hPlans[0] : lPlans.length > 0 ? lPlans[0] : null;
            if (plan) mPrice = mPrice + plan.amount;
        }

        return mPrice;
    }

    private filterAndSortPlans(plans: SpacePricePlanObject[], type: SpacePricePlanType, maxDuration: number) {
        return (
            plans
                .filter((p) => p.type === type && p.duration <= maxDuration)
                // .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .sort((a, b) => {
                    if (a.fromDate && b.fromDate) return b.fromDate.getTime() - a.fromDate.getTime();
                    if (a.fromDate && !b.fromDate) return -1;
                    if (!a.fromDate && b.fromDate) return 1;
                    return 0;
                })
                .sort((a, b) => b.duration - a.duration)
        );
    }
}
