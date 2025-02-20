import moment from "moment";
import { SpaceSetting } from "@prisma/client";
import { DateRange, dateRangesOverlap } from "@utils/date-utils/dateRangesOverlap";
import { Log } from "..";

export const getApplicableSettings = (spaceSettings: SpaceSetting[], reservationDateRange: DateRange) => {
    return spaceSettings.filter((setting) => {
        const { fromDate: _fromDate, toDate: _toDate } = setting;

        const settingDateRange = { from: moment(_fromDate), to: moment(_toDate) };

        Log("getApplicableSettings", { settingDateRange, reservationDateRange });

        return dateRangesOverlap(settingDateRange, reservationDateRange);
    });
};
