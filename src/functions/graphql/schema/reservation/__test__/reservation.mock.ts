import { SpacePricePlanObject } from "../../space/space-price-plans";

const defaultPlan1: SpacePricePlanObject = {
    amount: 4000,
    duration: 1,
    type: "DAILY",
};

const defaultPlan2: SpacePricePlanObject = {
    amount: 170,
    duration: 1,
    type: "HOURLY",
};

const defaultPlan3: SpacePricePlanObject = {
    amount: 20,
    duration: 5,
    type: "MINUTES",
};

const tfPlan1: SpacePricePlanObject = {
    amount: 8000,
    duration: 3,
    type: "DAILY",
    fromDate: new Date(2022, 3, 11),
    toDate: new Date(2022, 3, 15, 12, 30),
};

const tfPlan2: SpacePricePlanObject = {
    amount: 10000,
    duration: 3,
    type: "DAILY",
    fromDate: new Date(2022, 3, 17),
    toDate: new Date(2022, 3, 25),
};

export const reservation1 = {
    checkIn: new Date(2022, 3, 10),
    checkOut: new Date(2022, 3, 20),
    pricePlans: [defaultPlan1, defaultPlan2, defaultPlan3, defaultPlan3, tfPlan1, tfPlan2],
};
