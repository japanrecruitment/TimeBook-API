import { PricePlanOverride, SpacePricePlan } from "@prisma/client";

type ReservationPricePlan = Partial<SpacePricePlan> & Partial<Pick<PricePlanOverride, "daysOfWeek">>;

const defaultPlan1: ReservationPricePlan = {
    amount: 4000,
    duration: 1,
    type: "DAILY",
};

const defaultPlan2: ReservationPricePlan = {
    amount: 170,
    duration: 1,
    type: "HOURLY",
};

const defaultPlan3: ReservationPricePlan = {
    amount: 20,
    duration: 5,
    type: "MINUTES",
};

const dowPlan1: ReservationPricePlan = {
    amount: 5000,
    duration: 1,
    type: "DAILY",
    daysOfWeek: [2, 4],
};

const tfPlan1: ReservationPricePlan = {
    amount: 8000,
    duration: 3,
    type: "DAILY",
    fromDate: new Date(2022, 3, 11),
    toDate: new Date(2022, 3, 15, 12, 30),
};

const tfPlan2: ReservationPricePlan = {
    amount: 10000,
    duration: 3,
    type: "DAILY",
    fromDate: new Date(2022, 3, 17),
    toDate: new Date(2022, 3, 25),
};

export const reservation1 = {
    checkIn: new Date(2022, 3, 10),
    checkOut: new Date(2022, 3, 20),
    pricePlans: [defaultPlan1, defaultPlan2, defaultPlan3, defaultPlan3, dowPlan1, tfPlan1, tfPlan2],
};
