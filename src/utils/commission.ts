import { CommissionType } from "@prisma/client";

type CommissionHost = {
    commissionType?: CommissionType | null;
    commissionRate?: number | null;
    commissionYen?: number | null;
};

const DEFAULT_COMMISSION_RATE = 30;

export const calculateApplicationFeeAmount = (amount: number, host: CommissionHost | null | undefined): number => {
    if (!amount || amount <= 0) return 0;

    if (host?.commissionType === "Fixed") return Math.min(host.commissionYen ?? 0, amount);

    const commissionRate = host?.commissionRate ?? DEFAULT_COMMISSION_RATE;
    return parseInt((amount * (commissionRate / 100)).toString());
};
