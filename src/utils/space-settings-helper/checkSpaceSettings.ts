import moment from "moment";
import { SpaceSetting } from "@prisma/client";
import { DateRange } from "@utils/date-utils/dateRangesOverlap";
import { getApplicableSettings } from "./getApplicableSettings";
import { checkSpaceIsClosed } from "./checkSpaceIsClosed";
import { Log, getAllDatesBetn } from "..";

export const checkSpaceSettings = (spaceSettings: SpaceSetting[], reservationDateRange: DateRange) => {
    const defaultSetting = spaceSettings.filter(({ isDefault }) => isDefault);

    const applicableSettings = getApplicableSettings(spaceSettings, reservationDateRange);
    const spaceIsClosed = checkSpaceIsClosed(applicableSettings);

    Log({ applicableSettings });
    // return false if space is closed in override settings
    if (spaceIsClosed) return false;

    // check days of the week of the settings
    const reservationDates = getAllDatesBetn(reservationDateRange.from.toDate(), reservationDateRange.to.toDate());
    Log("RESERVATION DATES", reservationDates);

    // TODO: Fix this
    return true;
};
