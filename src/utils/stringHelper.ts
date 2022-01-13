import { SpacePricePlanType, SpacePricePlan } from "@prisma/client";

export const formatPrice = (
    mode: SpacePricePlanType = "HOURLY",
    prices: SpacePricePlan[],
    returnNumber: boolean = false,
    minimum: boolean = true
): any => {
    if (prices.length === 0) {
        return null;
    }

    const list: SpacePricePlan[] = prices.filter((pricePlan) => pricePlan.type === mode);

    if (list.length > 0 && minimum) {
        const minimumPrice: SpacePricePlan = list.reduce((previous, current) => {
            if (current.duration < previous.duration) {
                return current;
            } else {
                return previous;
            }
        });
        return formatPriceString(minimumPrice, returnNumber);
    }
    return list.map((pricePlan) => formatPriceString(pricePlan, returnNumber));
};

const formatPriceString = (pricePlan: SpacePricePlan, returnNumber: boolean = false): string | number => {
    if (pricePlan) {
        if (returnNumber) {
            return pricePlan.amount;
        } else {
            return `${priceFormatter(pricePlan.amount)}/${pricePlan.duration > 1 ? pricePlan.duration : ""}${
                pricePlan.type === "HOURLY" ? "時" : "日"
            }`;
        }
    }
    return null;
};

export const priceFormatter = (amount: number) => {
    const formatter = new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    return formatter.format(amount);
};
