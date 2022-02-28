import { PricePlanOverride, SpacePricePlan, SpacePricePlanType } from "@prisma/client";
import { getAllDatesBetn, getDurationsBetn } from "../../../../utils/date-utils";
import { omit } from "../../../../utils/object-helper";
import { concat, isEmpty, merge } from "lodash";
import moment from "moment";
import { SpacePricePlanObject } from "../space/space-price-plans";

type ReservationPricePlan = Partial<SpacePricePlan> & Partial<Pick<PricePlanOverride, "daysOfWeek">>;

type ReservationPriceCalculatorConstructorArgs = {
    checkIn: Date;
    checkOut: Date;
    pricePlans: SpacePricePlanObject[];
};

export default class ReservationPriceCalculator {
    private _checkIn: Date;
    private _checkOut: Date;
    private _pricePlans: Partial<ReservationPricePlan>[];
    private dumpedMinutes: number = 0;
    readonly price: number = 0;

    constructor(args: ReservationPriceCalculatorConstructorArgs) {
        const { checkIn, checkOut, pricePlans } = args;
        this._checkIn = checkIn;
        this._checkOut = checkOut;
        this._pricePlans = concat(
            pricePlans.map((p) => omit(p, "overrides")),
            pricePlans
                .flatMap((p) =>
                    p.overrides?.map((o) =>
                        merge(o, {
                            type: p.type,
                            duration: p.duration,
                            fromDate: o.fromDate || p.fromDate,
                            toDate: o.toDate || p.toDate,
                        })
                    )
                )
                .filter((p) => p)
        );
        this.price = this.calculatePrice(checkIn, checkOut, this._pricePlans) + this.calculatePriceOfDumpedMinutes();
    }

    private calculatePrice(from: Date, to: Date, plans: Partial<ReservationPricePlan>[]) {
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

        const mPlans: Partial<ReservationPricePlan>[] = concat(dailyPlans, hourlyPlans, minutesPlans);
        if (isEmpty(mPlans)) {
            this.dumpedMinutes = this.dumpedMinutes + minutes();
            return mPrice;
        }

        console.log(`${from}, ${to}`, mDurations);

        for (let i = 0; i < mPlans.length; i++) {
            const { amount, daysOfWeek, duration, fromDate, toDate, type } = mPlans[i];
            const unit = type === "DAILY" ? "days" : type === "HOURLY" ? "hours" : "minutes";
            if (fromDate && toDate) {
                const startMs = fromDate.getTime();
                const endMs = toDate.getTime();
                let isEligible: boolean = false;
                let eligibleStartDate: Date;
                let eligibleEndDate: Date;
                if (startMs >= mStartMs() && startMs <= mEndMs() && endMs > mEndMs()) {
                    isEligible = getDurationsBetn(fromDate, to)[unit] >= duration;
                    if (isEligible) {
                        eligibleStartDate = moment(to).subtract(duration, unit).toDate();
                        eligibleEndDate = to;
                    }
                } else if (startMs >= mStartMs() && startMs <= mEndMs() && endMs >= mStartMs() && endMs <= mEndMs()) {
                    isEligible = getDurationsBetn(fromDate, toDate)[unit] >= duration;
                    if (isEligible) {
                        eligibleStartDate = moment(toDate).subtract(duration, unit).toDate();
                        eligibleEndDate = toDate;
                    }
                } else if (endMs >= mStartMs() && endMs <= mEndMs() && startMs < mStartMs()) {
                    isEligible = getDurationsBetn(from, toDate)[unit] >= 0;
                    if (isEligible) {
                        eligibleStartDate = moment(toDate).subtract(duration, unit).toDate();
                        eligibleEndDate = toDate;
                    }
                }
                if (daysOfWeek && daysOfWeek.length > 0 && isEligible) {
                    const uDates = getAllDatesBetn(fromDate, toDate, { order: "desc" });
                    let matchedDate = uDates.find((d) => daysOfWeek.includes(moment(d).weekday()));
                    if (matchedDate) {
                        eligibleStartDate = moment(matchedDate).subtract(duration, unit).toDate();
                        eligibleEndDate = matchedDate;
                    }
                }
                if (isEligible && eligibleStartDate && eligibleEndDate) {
                    let remPrice1 = this.calculatePrice(eligibleEndDate, to, plans);
                    let remPrice2 = this.calculatePrice(from, eligibleStartDate, plans);
                    mPrice = mPrice + amount + remPrice1 + remPrice2;
                    this.logAppliedPrices(mPlans[i], mPrice, eligibleStartDate, eligibleEndDate);
                    break;
                }
            } else if (daysOfWeek && daysOfWeek.length > 0) {
                const uDates = getAllDatesBetn(from, to, { order: "desc" });
                let matchedDate = uDates.find((d) => daysOfWeek.includes(moment(d).weekday()));
                if (matchedDate) {
                    const eligibleStartDate = moment(matchedDate).subtract(duration, unit).toDate();
                    const eligibleEndDate = matchedDate;
                    let remPrice1 = this.calculatePrice(eligibleEndDate, to, plans);
                    let remPrice2 = this.calculatePrice(from, eligibleStartDate, plans);
                    mPrice = mPrice + amount + remPrice1 + remPrice2;
                    this.logAppliedPrices(mPlans[i], mPrice, eligibleStartDate, eligibleEndDate);
                    break;
                }
            } else {
                while (mDurations[unit] >= duration) {
                    mPrice = mPrice + amount;
                    this.logAppliedPrices(mPlans[i], mPrice);
                    mDurations[unit] = mDurations[unit] - duration;
                }
            }
        }

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

    private filterAndSortPlans(plans: ReservationPricePlan[], type: SpacePricePlanType, maxDuration: number) {
        return (
            plans
                .filter((p) => p.type === type && p.duration <= maxDuration)
                // .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .sort((a, b) => {
                    if (a.fromDate && b.fromDate) return b.fromDate.getTime() - a.fromDate.getTime();
                    if (a.fromDate && !b.fromDate) return -1;
                    if (!a.fromDate && b.fromDate) return 1;
                    if (!isEmpty(a.daysOfWeek) && !isEmpty(b.daysOfWeek)) {
                        const aMax = a.daysOfWeek.sort()[a.daysOfWeek.length - 1];
                        const bMax = b.daysOfWeek.sort()[b.daysOfWeek.length - 1];
                        return bMax - aMax;
                    }
                    if (!isEmpty(a.daysOfWeek) && isEmpty(b.daysOfWeek)) return -1;
                    if (isEmpty(a.daysOfWeek) && !isEmpty(b.daysOfWeek)) return 1;
                    return 0;
                })
                .sort((a, b) => b.duration - a.duration)
        );
    }

    private logAppliedPrices(pricePlan: ReservationPricePlan, price: number, from?: Date, to?: Date) {
        console.log(`plan: `, pricePlan);
        console.log(`from: ${from} to:${to} price: ${price}`);
        console.log();
    }
}
