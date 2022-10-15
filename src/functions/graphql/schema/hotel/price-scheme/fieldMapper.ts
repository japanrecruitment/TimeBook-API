const numAdult = {
    1: "oneAdultCharge",
    2: "twoAdultCharge",
    3: "threeAdultCharge",
    4: "fourAdultCharge",
    5: "fiveAdultCharge",
    6: "sixAdultCharge",
    7: "sevenAdultCharge",
    8: "eightAdultCharge",
    9: "nineAdultCharge",
    10: "tenAdultCharge",
};

const numChild = {
    1: "oneChildCharge",
    2: "twoChildCharge",
    3: "threeChildCharge",
    4: "fourChildCharge",
    5: "fiveChildCharge",
    6: "sixChildCharge",
    7: "sevenChildCharge",
    8: "eightChildCharge",
    9: "nineChildCharge",
    10: "tenChildCharge",
};

export function mapNumAdultField(index: number, defaultValue: string = "oneAdultCharge"): string | undefined {
    if (!index) return defaultValue;
    index = Math.floor(index);
    if (index < 1 || index > 10) return defaultValue;
    return numAdult[index];
}

export function mapNumChildField(index: number, defaultValue: string = "oneChildCharge"): string | undefined {
    if (!index) return defaultValue;
    index = Math.floor(index);
    if (index < 1 || index > 10) return defaultValue;
    return numChild[index];
}
