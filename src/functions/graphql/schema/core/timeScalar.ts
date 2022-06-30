import { Log } from "@utils/logger";
import { gql } from "apollo-server-core";
import { GraphQLScalarType, Kind, GraphQLError } from "graphql";
import moment from "moment";

// 24-hour time with optional seconds and milliseconds - `HH:mm[:ss[.SSS]]`
const LOCAL_TIME_FORMAT = /^([0-1][0-9]|2[0-3]):([0-5][0-9])(:[0-5][0-9](\.\d{3})?)?$/;

export function validateLocalTime(value: any) {
    if (typeof value !== "string") {
        throw new TypeError(`Value is not string: ${value}`);
    }

    const isValidFormat = LOCAL_TIME_FORMAT.test(value);
    if (!isValidFormat) {
        throw new TypeError(`Value is not a valid LocalTime: ${value}`);
    }

    return value;
}

function mapToDate(value: string): Date {
    const time = value.split(":");
    const date = moment();
    date.hours(parseFloat(time[0]));
    date.minutes(parseFloat(time[1]));
    date.seconds(parseFloat(time[2]));
    Log(time);
    Log(date);

    return date.toDate();
}

function mapToTime(date: Date): string {
    return moment(date).add(15, "m").format("HH:mm:ss");
}

export const TimeScalar: GraphQLScalarType = new GraphQLScalarType({
    name: "Time",
    description:
        "A local time string (i.e., with no associated timezone) in 24-hr `HH:mm[:ss[.SSS]]` format, e.g. `14:25` or `14:25:06` or `14:25:06.123`.",

    serialize(value) {
        // value sent to client as string
        Log(value, mapToTime(value));
        return validateLocalTime(mapToTime(value));
    },

    parseValue(value) {
        // value from client as json
        return mapToDate(validateLocalTime(value));
    },

    parseLiteral(ast) {
        // value from client in ast
        if (ast.kind !== Kind.STRING) {
            throw new GraphQLError(`Can only validate strings as local times but got a: ${ast.kind}`);
        }

        return mapToDate(validateLocalTime(ast.value));
    },
});

export const timeScalarTypeDefs = gql`
    scalar Time
`;

export const timeScalarResolvers = {
    Time: TimeScalar,
};
