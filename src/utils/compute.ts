export const randomNumberOfNDigits = (n: number) => {
    const max = Math.pow(10, n) - 1;
    const min = Math.pow(10, n - 1);

    return Math.floor(Math.random() * (max - min + 1)) + min;
};

type TimeUnits = "ns" | "μs" | "ms" | "s" | "min" | "hrs" | "d" | "wk" | "mth" | "yr";

export const seconds = {
    from: (n: number, unit: TimeUnits) => {
        switch (unit) {
            case "ns":
                return n / 1e9;
            case "μs":
                return n / 1e6;
            case "ms":
                return n / 1000;
            case "min":
                return n * 60;
            case "hrs":
                return n * 3600;
            case "d":
                return n * 86400;
            case "wk":
                return n * 604800;
            case "mth":
                return n * 2.628e6;
            case "yr":
                return n * 3.154e7;
            default:
                return n;
        }
    },
    to: (n: number, unit: TimeUnits) => {
        switch (unit) {
            case "ns":
                return n * 1e9;
            case "μs":
                return n * 1e6;
            case "ms":
                return n * 1000;
            case "min":
                return n / 60;
            case "hrs":
                return n / 3600;
            case "d":
                return n / 86400;
            case "wk":
                return n / 604800;
            case "mth":
                return n / 2.628e6;
            case "yr":
                return n / 3.154e7;
            default:
                return n;
        }
    },
};
