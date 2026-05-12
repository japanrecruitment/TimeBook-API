import { PricePlanOverride, SpacePricePlan, SpacePricePlanType } from "@prisma/client";
import { getAllDatesBetn, getDurationsBetn } from "../../../../utils/date-utils";
import { omit } from "../../../../utils/object-helper";
import { Log } from "../../../../utils/logger";
import { concat, isEmpty, merge } from "lodash";
import moment from "moment";
import { SpacePricePlanObject } from "../space/space-price-plans";

type ReservationPricePlan = { isOverride: boolean } & Partial<SpacePricePlan> &
    Partial<Pick<PricePlanOverride, "daysOfWeek" | "pricePlanId">> & { appliedTimes?: number };

type ReservationPriceCalculatorConstructorArgs = {
    checkIn: Date;
    checkOut: Date;
    pricePlans: SpacePricePlanObject[];
};

export default class ReservationPriceCalculator {
    private _checkIn: Date;
    private _checkOut: Date;
    private _pricePlans: ReservationPricePlan[];
    private dumpedMinutes: number = 0;
    readonly appliedReservationPlans: ReservationPricePlan[] = [];
    readonly price: number = 0;

    constructor(args: ReservationPriceCalculatorConstructorArgs) {
        const { checkIn, checkOut, pricePlans } = args;
        // Log("ReservationPriceCalculator", pricePlans, checkIn, checkOut);
        // Keep checkIn as is - don't add extra day
        this._checkIn = checkIn;
        // Add 1 day to checkOut to include checkout day in pricing calculation
        this._checkOut = checkOut;
        this._pricePlans = concat(
            pricePlans.map((p) => ({ isOverride: false, ...omit(p, "overrides") })),
            pricePlans
                .flatMap((p) =>
                    p.overrides?.map((o) =>
                        merge(o, {
                            isOverride: true,
                            title: p.title,
                            type: p.type,
                            duration: p.duration,
                            fromDate: o.fromDate || p.fromDate,
                            toDate: o.toDate || p.toDate,
                        }),
                    ),
                )
                .filter((p) => p),
        );
        Log("ReservationPriceCalculator", this._checkIn, this._checkOut);
        this.price =
            this.calculatePrice(this._checkIn, this._checkOut, this._pricePlans) + this.calculatePriceOfDumpedMinutes();
        // Log(this.price,"price");
        this.appliedReservationPlans = this.distinctAppliedPlans(this.appliedReservationPlans);
        Log("Final Applied Plans", {
            totalPlans: this.appliedReservationPlans.length,
            plans: this.appliedReservationPlans.map((p) => ({
                title: p.title,
                amount: p.amount,
                isOverride: p.isOverride,
                appliedTimes: p.appliedTimes,
            })),
        });
        // Log(this.appliedReservationPlans,"appliedReservationPlans");
    }

    private calculatePrice(from: Date, to: Date, plans: ReservationPricePlan[]) {
        const mDurations = getDurationsBetn(from, to);

        const days = () => mDurations.days;
        const hours = () => mDurations.hours;
        const minutes = () => mDurations.minutes;
        let mFrom = from;
        let mTo = to;
        const mStartMs = () => mFrom.getTime();
        const mEndMs = () => mTo.getTime();
        let mPrice: number = 0;

        const dailyPlans = days() > 0 ? this.filterAndSortPlans(plans, "DAILY", days()) : [];
        if (days() > 0 && isEmpty(dailyPlans)) mDurations.hours = hours() + days() * 24;
        const hourlyPlans = hours() > 0 ? this.filterAndSortPlans(plans, "HOURLY", hours()) : [];
        if (hours() > 0 && isEmpty(hourlyPlans)) mDurations.minutes = minutes() + hours() * 60;
        const minutesPlans = minutes() > 0 ? this.filterAndSortPlans(plans, "MINUTES", minutes()) : [];

        const mPlans: ReservationPricePlan[] = concat(dailyPlans, hourlyPlans, minutesPlans);
        if (isEmpty(mPlans)) {
            this.dumpedMinutes = this.dumpedMinutes + minutes();
            return mPrice;
        }

        // 'Thu Mar 24 2022 20:45:00 GMT+0545 (Nepal Time), Fri Mar 25 2022 20:45:00 GMT+0545 (Nepal Time)' { days: 1, hours: 0, minutes: 0 }
        // Log(`${mFrom}, ${mTo}`, mDurations);
        // Log('mPlans', mPlans);
        const sortedPlans = [...mPlans].sort((a, b) => {
            // Calculate overlap percentage for plan a (same logic as plan selection)
            const aOverlapStart = a.fromDate && a.toDate ? Math.max(mFrom.getTime(), a.fromDate.getTime()) : 0;
            const aOverlapEnd = a.fromDate && a.toDate ? Math.min(mTo.getTime(), a.toDate.getTime()) : 0;
            const aOverlapDuration = Math.max(0, aOverlapEnd - aOverlapStart);
            const aReservationDuration = mTo.getTime() - mFrom.getTime();
            const aOverlapPercentage = aReservationDuration > 0 ? aOverlapDuration / aReservationDuration : 0;
            const aShouldUseOverride = aOverlapPercentage >= 0.5;

            // Calculate overlap percentage for plan b (same logic as plan selection)
            const bOverlapStart = b.fromDate && b.toDate ? Math.max(mFrom.getTime(), b.fromDate.getTime()) : 0;
            const bOverlapEnd = b.fromDate && b.toDate ? Math.min(mTo.getTime(), b.toDate.getTime()) : 0;
            const bOverlapDuration = Math.max(0, bOverlapEnd - bOverlapStart);
            const bReservationDuration = mTo.getTime() - mFrom.getTime();
            const bOverlapPercentage = bReservationDuration > 0 ? bOverlapDuration / bReservationDuration : 0;
            const bShouldUseOverride = bOverlapPercentage >= 0.5;

            // Handle null fromDate/toDate in sorting
            const aFromDate = a.fromDate || new Date(0);
            const bFromDate = b.fromDate || new Date(0);

            // Plans with 50%+ overlap come first
            if (aShouldUseOverride && !bShouldUseOverride) return -1;
            if (!aShouldUseOverride && bShouldUseOverride) return 1;

            // If both have 50%+ overlap, prioritize overrides first
            if (aShouldUseOverride && bShouldUseOverride) {
                if (a.isOverride && !b.isOverride) return -1;
                if (!a.isOverride && b.isOverride) return 1;
                // If both are overrides or both are not overrides, prioritize the one with earlier fromDate
                return aFromDate.getTime() - bFromDate.getTime();
            }

            // Then prioritize overrides (but only if they don't meet 50% threshold)
            if (a.isOverride && !b.isOverride) return 1; // Flip: overrides should come last if not 50%
            if (!a.isOverride && b.isOverride) return -1; // Flip: non-overrides should come first

            // Finally, default plans come last
            if (a.isDefault && !b.isDefault) return 1;
            if (!a.isDefault && b.isDefault) return -1;

            return 0;
        });
        // Log(sortedPlans, "sortedPlans");
        Log("Available Plans Before Processing", {
            totalPlans: sortedPlans.length,
            plans: sortedPlans.map((p) => ({
                title: p.title,
                amount: p.amount,
                isOverride: p.isOverride,
                fromDate: p.fromDate,
                toDate: p.toDate,
                duration: p.duration,
            })),
        });
        for (let i = 0; i < sortedPlans.length; i++) {
            const plan = sortedPlans[i];
            const { amount, daysOfWeek, duration, fromDate, toDate, type } = plan;
            const unit = type === "DAILY" ? "days" : type === "HOURLY" ? "hours" : "minutes";
            const coversReservation = fromDate && toDate ? mFrom >= fromDate && mTo <= toDate : false;

            // Check if there's any overlap between reservation and plan dates
            const hasOverlap = fromDate && toDate ? mFrom <= toDate && mTo >= fromDate : false;

            // Calculate overlap percentage - only use override if majority of reservation is covered
            const overlapStart = fromDate ? Math.max(mFrom.getTime(), fromDate.getTime()) : mFrom.getTime();
            const overlapEnd = toDate ? Math.min(mTo.getTime(), toDate.getTime()) : mTo.getTime();
            const overlapDuration = Math.max(0, overlapEnd - overlapStart);
            const reservationDuration = mTo.getTime() - mFrom.getTime();
            const overlapPercentage = reservationDuration > 0 ? overlapDuration / reservationDuration : 0;

            // Only consider override if at least 50% of reservation is covered
            const shouldUseOverride = overlapPercentage >= 0.5;

            // Debug overlap calculation
            Log("Overlap Calculation", {
                planTitle: plan.title,
                mFrom: mFrom.toISOString(),
                mTo: mTo.toISOString(),
                fromDate: fromDate ? fromDate.toISOString() : "null",
                toDate: toDate ? toDate.toISOString() : "null",
                overlapStart: new Date(overlapStart).toISOString(),
                overlapEnd: new Date(overlapEnd).toISOString(),
                overlapDuration: overlapDuration / (1000 * 60 * 60), // in hours
                reservationDuration: reservationDuration / (1000 * 60 * 60), // in hours
                overlapPercentage: overlapPercentage * 100, // in percentage
            });

            if (shouldUseOverride) {
                if (type === "DAILY") {
                    // For DAILY plans, amount is the total price for the duration, not per-day
                    const days = Math.ceil((mTo.getTime() - mFrom.getTime()) / (1000 * 60 * 60 * 24));
                    mPrice = amount; // Fixed: 23 total for 2-day block, not 23 * days
                    sortedPlans[i].appliedTimes = 1; // Applied once for the duration block

                    this.appliedReservationPlans.push(sortedPlans[i]);
                    this.logAppliedPrices(sortedPlans[i], mPrice, mFrom, mTo);
                    break;
                } else if (type === "HOURLY") {
                    const reservationHours = Math.ceil((mTo.getTime() - mFrom.getTime()) / (1000 * 60 * 60));

                    // Only apply the plan if reservation duration matches plan duration
                    if (reservationHours !== duration) {
                        continue;
                    }

                    // For HOURLY plans, amount is the total price for the duration, not per-hour
                    mPrice = amount; // Fixed: 2500 total, not 2500 * hours
                    sortedPlans[i].appliedTimes = 1; // Applied once for the duration
                    this.appliedReservationPlans.push(sortedPlans[i]);
                    this.logAppliedPrices(sortedPlans[i], mPrice, mFrom, mTo);
                    break;
                } else {
                    // For MINUTES type
                    mPrice = amount;
                    sortedPlans[i].appliedTimes = 1;
                    this.appliedReservationPlans.push(sortedPlans[i]);
                    this.logAppliedPrices(sortedPlans[i], mPrice, mFrom, mTo);
                    break;
                }
            } else if (fromDate && toDate) {
                // Handle plans with date ranges that don't meet 50% threshold
                const startMs = fromDate.getTime();
                const endMs = toDate.getTime();
                let isEligible: boolean = false;
                let eligibleStartDate: Date;
                let eligibleEndDate: Date;
                if (startMs > mStartMs() && startMs < mEndMs() && endMs > mEndMs()) {
                    isEligible = getDurationsBetn(fromDate, mTo)[unit] >= duration;
                    if (isEligible) {
                        eligibleStartDate = moment(mTo).subtract(duration, unit).toDate();
                        eligibleEndDate = mTo;
                    }
                } else if (startMs >= mStartMs() && startMs <= mEndMs() && endMs >= mStartMs() && endMs <= mEndMs()) {
                    isEligible = getDurationsBetn(fromDate, toDate)[unit] >= duration;
                    if (isEligible) {
                        eligibleStartDate = moment(toDate).subtract(duration, unit).toDate();
                        eligibleEndDate = toDate;
                    }
                } else if (endMs >= mStartMs() && endMs <= mEndMs() && startMs < mStartMs()) {
                    isEligible = getDurationsBetn(mFrom, toDate)[unit] >= 0;
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
                    if (eligibleEndDate.getTime() <= mStartMs()) {
                        mPrice = mPrice + amount;
                    } else {
                        let remPrice1 = this.calculatePrice(eligibleEndDate, mTo, plans);
                        let remPrice2 = this.calculatePrice(mFrom, eligibleStartDate, plans);
                        mPrice = mPrice + amount + remPrice1 + remPrice2;
                    }
                    this.appliedReservationPlans.push(mPlans[i]);
                    this.logAppliedPrices(mPlans[i], mPrice, eligibleStartDate, eligibleEndDate);
                    break;
                }
            } else if (daysOfWeek && daysOfWeek.length > 0) {
                const uDates = getAllDatesBetn(mFrom, mTo, { order: "desc" });
                let matchedDate = uDates.find((d) => daysOfWeek.includes(moment(d).weekday()));
                if (matchedDate) {
                    const eligibleStartDate = moment(matchedDate).subtract(duration, unit).toDate();
                    const eligibleEndDate = matchedDate;
                    if (eligibleEndDate.getTime() <= mStartMs()) {
                        mPrice = mPrice + amount;
                    } else {
                        let remPrice1 = this.calculatePrice(eligibleEndDate, mTo, plans);
                        let remPrice2 = this.calculatePrice(mFrom, eligibleStartDate, plans);
                        mPrice = mPrice + amount + remPrice1 + remPrice2;
                    }
                    this.appliedReservationPlans.push(mPlans[i]);
                    this.logAppliedPrices(mPlans[i], mPrice, eligibleStartDate, eligibleEndDate);
                    break;
                }
                continue;
            } else {
                while (mDurations[unit] >= duration) {
                    mPrice = mPrice + amount;
                    this.appliedReservationPlans.push(mPlans[i]);
                    this.logAppliedPrices(mPlans[i], mPrice);
                    mDurations[unit] = mDurations[unit] - duration;
                    mTo = moment(mTo).subtract(duration, unit).toDate();
                }
            }
        }
        Log(mPrice, "mPrice");
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
                this.appliedReservationPlans.push(dailyPlans[i]);
            }
        }

        if (days > 0) hours = hours + days * 24;
        for (let i = 0; i < hourlyPlans.length; i++) {
            const { amount, duration } = hourlyPlans[i];
            if (hours >= duration) {
                mPrice = mPrice + amount;
                hours = hours - duration;
                this.appliedReservationPlans.push(hourlyPlans[i]);
            }
        }

        if (hours > 0) minutes = minutes + hours * 24;
        for (let i = 0; i < minutesPlans.length; i++) {
            const { amount, duration } = minutesPlans[i];
            if (minutes >= duration) {
                mPrice = mPrice + amount;
                minutes = minutes - duration;
                this.appliedReservationPlans.push(minutesPlans[i]);
            }
        }

        if (minutes > 0) {
            const iPlans = plans.filter(({ type }) => type === "MINUTES").sort((a, b) => b.duration - a.duration);
            const hPlans = iPlans.filter(({ duration }) => duration >= minutes);
            const lPlans = iPlans.filter(({ duration }) => duration <= minutes);
            const plan = hPlans.length > 0 ? hPlans[0] : lPlans.length > 0 ? lPlans[0] : null;
            if (plan) {
                mPrice = mPrice + plan.amount;
                this.appliedReservationPlans.push(plan);
            }
        }

        return mPrice;
    }

    private filterAndSortPlans(plans: ReservationPricePlan[], type: SpacePricePlanType, maxDuration: number) {
        return plans
            .filter((p) => p.type === type) // Remove duration filter to allow longer plans for shorter requests
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
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
            .sort((a, b) => b.duration - a.duration);
    }

    private distinctAppliedPlans(plans: ReservationPricePlan[]) {
        let newPlans: ReservationPricePlan[] = [];

        for (const plan of plans) {
            const nPlan = newPlans.find((p) => p.id === plan.id);

            if (!nPlan) {
                newPlans.push({ ...plan, appliedTimes: 1 });
            } else {
                newPlans = newPlans.filter((p) => p.id !== plan.id);
                newPlans.push({ ...plan, appliedTimes: nPlan.appliedTimes + 1 });
            }
        }
        return newPlans;
    }

    private logAppliedPrices(pricePlan: ReservationPricePlan, price: number, from?: Date, to?: Date) {
        // Log(`plan: `, pricePlan);
        // Log(`from: ${from} to:${to} price: ${price}`);
    }
}
